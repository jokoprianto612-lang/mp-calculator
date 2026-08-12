/**
 * Authentication Service
 */

import { prisma } from '../lib/prisma';
import { hashPassword, verifyPassword, validatePasswordStrength } from '../lib/password';
import { signAccessToken, signRefreshToken, verifyToken } from '../lib/jwt';
import { redis } from '../lib/redis';
import { config } from '../config';
import type { RegisterInput, LoginInput, OAuthCallbackInput } from '@mp-calculator/shared';
import type { User } from '@prisma/client';

const REFRESH_TOKEN_PREFIX = 'refresh_token_set:';
const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60; // 7 days

export class AuthService {
  /**
   * Register a new user with email/password
   */
  async register(data: RegisterInput) {
    // Validate password strength
    const passwordValidation = validatePasswordStrength(data.password);
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.errors.join(', '));
    }

    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new Error('Registration failed. Please check your details and try again.');
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name,
        provider: 'email',
      },
    });

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email);

    // Store refresh token
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return { user: this.sanitizeUser(user), ...tokens };
  }

  /**
   * Login with email/password
   */
  async login(data: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    // Always run a dummy hash to prevent timing-based user enumeration
    const dummyHash = '$argon2id$v=19$m=65536,t=3,p=4$ZGVjb3lzYWx0c2FsdA$5n5M6DpQ3x9L1QFqKvKqvKt5QwJ7h3n9RkF1M8sZT6M';
    const hashToVerify = user?.passwordHash ?? dummyHash;
    const valid = await verifyPassword(hashToVerify, data.password);
    if (!user || !valid) {
      throw new Error('Invalid email or password');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email);

    // Store refresh token
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    // Update last login (optional)
    await prisma.user.update({
      where: { id: user.id },
      data: { updatedAt: new Date() },
    });

    return { user: this.sanitizeUser(user), ...tokens };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string) {
    // Verify refresh token
    let payload;
    try {
      payload = await verifyToken(refreshToken);
    } catch {
      throw new Error('Invalid or expired refresh token');
    }

    // Check if token exists in Redis (multi-device: token must be a member of user's set)
    const member = await redis.sismember(`${REFRESH_TOKEN_PREFIX}${payload.sub}`, refreshToken);
    if (!member) {
      throw new Error('Refresh token revoked');
    }

    // Get user
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      throw new Error('User not found');
    }

    // Generate new tokens
    const tokens = await this.generateTokens(user.id, user.email);

    // Store new refresh token (rotate)
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  /**
   * Logout - revoke refresh token (single device)
   */
  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      // Remove only this token from the set (single-device logout)
      await redis.srem(`${REFRESH_TOKEN_PREFIX}${userId}`, refreshToken);
    } else {
      // Fallback: clear all tokens for user
      await redis.del(`${REFRESH_TOKEN_PREFIX}${userId}`);
    }
  }

  /**
   * Get current user from access token
   */
  async getCurrentUser(accessToken: string) {
    const payload = await verifyToken(accessToken);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw new Error('User not found');
    return this.sanitizeUser(user);
  }

  /**
   * Handle OAuth callback (Google/GitHub)
   */
  async handleOAuthCallback(data: OAuthCallbackInput) {
    // This would integrate with Google/GitHub OAuth APIs
    // For now, throwing not implemented
    throw new Error('OAuth not yet implemented');
  }

  /**
   * Change password
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.passwordHash) {
      throw new Error('User not found or uses OAuth');
    }

    // Verify current password
    const valid = await verifyPassword(user.passwordHash, currentPassword);
    if (!valid) {
      throw new Error('Current password is incorrect');
    }

    // Validate new password
    const validation = validatePasswordStrength(newPassword);
    if (!validation.valid) {
      throw new Error(validation.errors.join(', '));
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    // Revoke all refresh tokens (force re-login on all devices)
    await redis.del(`${REFRESH_TOKEN_PREFIX}${userId}`);

    return { success: true };
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, data: { name?: string; avatar?: string; locale?: string; theme?: string }) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        avatar: data.avatar,
        locale: data.locale,
        theme: data.theme,
      },
    });

    return this.sanitizeUser(user);
  }

  /**
   * Generate access and refresh tokens
   */
  private async generateTokens(userId: string, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      signAccessToken({ sub: userId, email }),
      signRefreshToken({ sub: userId }),
    ]);

    return { accessToken, refreshToken, expiresIn: 15 * 60 }; // 15 minutes
  }

  /**
   * Store refresh token in Redis (multi-device: add to set with TTL)
   */
  private async storeRefreshToken(userId: string, refreshToken: string) {
    const key = `${REFRESH_TOKEN_PREFIX}${userId}`;
    await redis.sadd(key, refreshToken);
    await redis.expire(key, REFRESH_TOKEN_TTL);
  }

  /**
   * Remove sensitive fields from user object
   */
  private sanitizeUser(user: User) {
    const { passwordHash, ...sanitized } = user;
    return sanitized;
  }
}

export const authService = new AuthService();