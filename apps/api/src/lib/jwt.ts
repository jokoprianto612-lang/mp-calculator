/**
 * JWT Utilities using Node built-in crypto (HMAC-SHA256)
 * Zero external deps, full control, standard JWT format
 */

import { createHmac, timingSafeEqual } from 'node:crypto';
import { config } from '../config';

export interface AccessTokenPayload {
  sub: string;
  email: string;
  provider?: string;
  type: 'access';
}

export interface RefreshTokenPayload {
  sub: string;
  type: 'refresh';
}

type JwtPayload = AccessTokenPayload | RefreshTokenPayload;


function ttlSeconds(duration: string): number {
  const m = /^(\d+)([smhd])$/.exec(duration);
  if (!m) return 60 * 60; // 1h fallback
  const n = Number(m[1]);
  const unit = m[2];
  if (unit === 's') return n;
  if (unit === 'm') return n * 60;
  if (unit === 'h') return n * 60 * 60;
  return n * 60 * 60 * 24;
}

const ENCODER = new TextEncoder();
const SECRET = config.jwt.secret;

function base64url(input: string | Buffer): string {
  const buf = typeof input === 'string' ? Buffer.from(input, 'utf-8') : Buffer.from(input);
  return buf.toString('base64url');
}

function sign(input: string): string {
  const hmac = createHmac('sha256', SECRET);
  hmac.update(input);
  return base64url(hmac.digest());
}

export function signAccessToken(payload: Omit<AccessTokenPayload, 'type'>): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const exp = now + ttlSeconds(config.jwt.accessExpiresIn);
  const body = { ...payload, type: 'access' as const, iat: now, exp };
  const headerB64 = base64url(JSON.stringify(header));
  const bodyB64 = base64url(JSON.stringify(body));
  const sig = sign(`${headerB64}.${bodyB64}`);
  return `${headerB64}.${bodyB64}.${sig}`;
}

export function signRefreshToken(payload: Omit<RefreshTokenPayload, 'type'>): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const exp = now + ttlSeconds(config.jwt.refreshExpiresIn);
  const body = { ...payload, type: 'refresh' as const, iat: now, exp };
  const headerB64 = base64url(JSON.stringify(header));
  const bodyB64 = base64url(JSON.stringify(body));
  const sig = sign(`${headerB64}.${bodyB64}`);
  return `${headerB64}.${bodyB64}.${sig}`;
}

function safeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a, 'utf-8');
  const bBuf = Buffer.from(b, 'utf-8');
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}

export function verifyToken<T extends JwtPayload = JwtPayload>(token: string): T {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid token format');
  const headerB64 = parts[0]!;
  const payloadB64 = parts[1]!;
  const sig = parts[2]!;
  const expected = sign(`${headerB64}.${payloadB64}`);
  if (!safeEqual(expected, sig)) throw new Error('Invalid signature');
  const body = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8')) as JwtPayload & { exp: number; iat: number };
  if (body.exp && body.exp * 1000 < Date.now()) throw new Error('Token expired');
  return body as unknown as T;
}
