/**
 * Google OAuth Service
 * Implements OAuth 2.0 authorization code flow with Google.
 * Gracefully no-ops if GOOGLE_CLIENT_ID is not configured.
 */

import { prisma } from '../lib/prisma';
import { config } from '../config';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo';

export interface GoogleProfile {
  id: string;
  email: string;
  emailVerified: boolean;
  name: string;
  picture?: string;
}

export interface GoogleTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  scope?: string;
  tokenType?: string;
}

export class GoogleOAuthService {
  isConfigured(): boolean {
    return Boolean(config.oauth.google.clientId && config.oauth.google.clientSecret);
  }

  /**
   * Build Google authorization URL with CSRF state.
   */
  buildAuthUrl(state: string): string {
    if (!this.isConfigured()) {
      throw new Error('Google OAuth not configured');
    }
    const params = new URLSearchParams({
      client_id: config.oauth.google.clientId!,
      redirect_uri: config.oauth.google.callbackUrl ?? 'http://localhost:3000/api/v1/auth/oauth/google/callback',
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent',
      state,
    });
    return `${GOOGLE_AUTH_URL}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for tokens.
   */
  async exchangeCode(code: string): Promise<GoogleTokens> {
    if (!this.isConfigured()) {
      throw new Error('Google OAuth not configured');
    }
    const params = new URLSearchParams({
      code,
      client_id: config.oauth.google.clientId!,
      client_secret: config.oauth.google.clientSecret!,
      redirect_uri: config.oauth.google.callbackUrl ?? 'http://localhost:3000/api/v1/auth/oauth/google/callback',
      grant_type: 'authorization_code',
    });

    const res = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Google token exchange failed: ${err}`);
    }

    const data = (await res.json()) as {
      access_token: string;
      refresh_token?: string;
      expires_in?: number;
      scope?: string;
      token_type?: string;
    };

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : undefined,
      scope: data.scope,
      tokenType: data.token_type,
    };
  }

  /**
   * Fetch user profile using access token.
   */
  async fetchProfile(accessToken: string): Promise<GoogleProfile> {
    const res = await fetch(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) {
      throw new Error(`Google userinfo fetch failed: ${res.status}`);
    }
    const data = (await res.json()) as {
      sub: string;
      email: string;
      email_verified: boolean;
      name: string;
      picture?: string;
    };
    return {
      id: data.sub,
      email: data.email,
      emailVerified: data.email_verified,
      name: data.name,
      picture: data.picture,
    };
  }

  /**
   * Find or create user from Google profile.
   * - If user with same email exists, link Google account
   * - If no user, create new user with email verified
   */
  async findOrCreateUser(profile: GoogleProfile): Promise<{ user: any; isNew: boolean }> {
    if (!profile.emailVerified) {
      throw new Error('Google account email is not verified');
    }

    // Check for existing OAuthAccount link
    const existingOauth = await prisma.oAuthAccount.findUnique({
      where: { provider_providerId: { provider: 'google', providerId: profile.id } },
      include: { user: true },
    });

    if (existingOauth) {
      return { user: existingOauth.user, isNew: false };
    }

    // Check for existing user with same email
    const existingUser = await prisma.user.findUnique({
      where: { email: profile.email },
    });

    let user;
    if (existingUser) {
      // Link Google account to existing user
      user = existingUser;
      // Update emailVerified if not yet
      if (!user.emailVerified) {
        await prisma.user.update({
          where: { id: user.id },
          data: { emailVerified: new Date() },
        });
      }
    } else {
      // Create new user
      user = await prisma.user.create({
        data: {
          email: profile.email,
          name: profile.name,
          avatar: profile.picture,
          provider: 'google',
          providerId: profile.id,
          emailVerified: new Date(),
        },
      });
    }

    // Create OAuthAccount link
    await prisma.oAuthAccount.create({
      data: {
        userId: user.id,
        provider: 'google',
        providerId: profile.id,
      },
    });

    return { user, isNew: !existingUser };
  }
}

export const googleOAuthService = new GoogleOAuthService();
