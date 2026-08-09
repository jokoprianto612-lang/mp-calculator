/**
 * JWT Utilities
 */

import { config } from '../config';
import { jwtVerify, SignJWT, type JWTPayload } from 'jose';

const secret = new TextEncoder().encode(config.jwt.secret);

export interface AccessTokenPayload extends JWTPayload {
  sub: string;
  email: string;
  type: 'access';
}

export interface RefreshTokenPayload extends JWTPayload {
  sub: string;
  email: string;
  type: 'refresh';
}

export async function createAccessToken(userId: string, email: string): Promise<string> {
  return new SignJWT({ sub: userId, email, type: 'access' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(config.jwt.accessExpiresIn)
    .sign(secret);
}

export async function createRefreshToken(userId: string, email: string): Promise<string> {
  return new SignJWT({ sub: userId, email, type: 'refresh' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(config.jwt.refreshExpiresIn)
    .sign(secret);
}

export async function verifyAccessToken(token: string): Promise<AccessTokenPayload> {
  const { payload } = await jwtVerify(token, secret);
  if (payload.type !== 'access') throw new Error('Invalid token type');
  return payload as unknown as AccessTokenPayload;
}

export async function verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
  const { payload } = await jwtVerify(token, secret);
  if (payload.type !== 'refresh') throw new Error('Invalid token type');
  return payload as unknown as RefreshTokenPayload;
}

export async function verifyToken(token: string): Promise<AccessTokenPayload | RefreshTokenPayload> {
  const { payload } = await jwtVerify(token, secret);
  return payload as unknown as AccessTokenPayload | RefreshTokenPayload;
}