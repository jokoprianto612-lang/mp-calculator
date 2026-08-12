/**
 * Email OTP Service
 * Generates, stores, and verifies one-time passwords for passwordless login.
 * Falls back to console.log when RESEND_API_KEY is not configured (dev).
 */

import { createHmac, randomInt, timingSafeEqual } from 'node:crypto';
import { prisma } from '../lib/prisma';
import { config } from '../config';
import { Resend } from 'resend';

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const OTP_LENGTH = 6;
const MAX_ATTEMPTS = 5;

const SECRET = config.jwt.secret;

function hashCode(email: string, code: string): string {
  return createHmac('sha256', SECRET).update(`${email.toLowerCase()}:${code}`).digest('hex');
}

function generateCode(): string {
  // 6-digit numeric code, leading zeros allowed
  return randomInt(0, 10 ** OTP_LENGTH).toString().padStart(OTP_LENGTH, '0');
}

let resendClient: Resend | null = null;
function getResend(): Resend | null {
  const key = (config as any).resend?.apiKey;
  if (!key) return null;
  if (!resendClient) resendClient = new Resend(key);
  return resendClient;
}

const EMAIL_TEMPLATE = (code: string, ttlMinutes: number) => ({
  subject: `Kode Login MP Calculator: ${code}`,
  html: `
    <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #00A651; margin: 0 0 16px;">MP Calculator</h2>
      <p style="color: #333; font-size: 16px;">Kode login kamu</p>
      <div style="background: #f5f5f5; padding: 24px; text-align: center; border-radius: 12px; margin: 24px 0;">
        <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #000;">${code}</span>\n      </div>
      <p style="color: #666; font-size: 14px;">Kode ini berlaku ${ttlMinutes} menit. Jangan berikan ke siapapun</p>
      <p style="color: #999; font-size: 12px; margin-top: 24px;">Kalau kamu tidak request kode ini, abaikan email ini</p>
   </div>
  `,
});

export class OtpService {
  /**
   * Generate OTP for an email and send via Resend (or log to console in dev).
   */
  async requestOtp(email: string): Promise<{ code: string; devMode: boolean }> {
    const normalized = email.toLowerCase().trim();
    const code = generateCode();
    const codeHash = hashCode(normalized, code);

    // Invalidate any previous active OTPs for this email (prevent stacking)
    await prisma.emailOtp.deleteMany({
      where: {
        email: normalized,
        consumed: false,
        expiresAt: { gt: new Date() },
      },
    });

    // Store new OTP (hashed)
    await prisma.emailOtp.create({
      data: {
        email: normalized,
        code: codeHash,
        expiresAt: new Date(Date.now() + OTP_TTL_MS),
      },
    });

    // Send via Resend if configured
    const resend = getResend();
    const devMode = !resend;

    if (resend) {
      const fromAddress = (config as any).resend?.fromEmail ?? 'noreply@mp-calculator.app';
      const tpl = EMAIL_TEMPLATE(code, OTP_TTL_MS / 60000);
      try {
        await resend.emails.send({
          from: fromAddress,
          to: normalized,
          subject: tpl.subject,
          html: tpl.html,
        });
      } catch (err) {
        // Don't leak error details to client, but log for ops
        console.error('[OTP] Resend failed:', err);
        // Fall back to console log so dev can still test
        console.log(`[OTP DEV] Email=${normalized} Code=${code}`);
      }
    } else {
      // Dev fallback: log to console
      console.log(`\n========== OTP (DEV MODE - no RESEND_API_KEY) ==========`);
      console.log(`  Email: ${normalized}`);
      console.log(`  Code:  ${code}`);
      console.log(`  Valid: ${OTP_TTL_MS / 60000} minutes`);
      console.log(`========================================================\n`);
    }

    return { code, devMode };
  }

  /**
   * Verify OTP for an email. Marks as consumed on success.
   * Returns true if valid, false otherwise.
   */
  async verifyOtp(email: string, code: string): Promise<boolean> {
    const normalized = email.toLowerCase().trim();

    // Find latest unconsumed, non-expired OTP
    const otp = await prisma.emailOtp.findFirst({
      where: {
        email: normalized,
        consumed: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otp) return false;

    // Atomic increment attempts
    const updated = await prisma.emailOtp.updateMany({
      where: { id: otp.id, attempts: { lt: MAX_ATTEMPTS } },
      data: { attempts: { increment: 1 } },
    });

    if (updated.count === 0) {
      // Already exceeded max attempts
      return false;
    }

    // Constant-time comparison
    const codeHash = hashCode(normalized, code);
    const a = Buffer.from(codeHash, 'utf-8');
    const b = Buffer.from(otp.code, 'utf-8');
    if (a.length !== b.length) return false;
    const matches = timingSafeEqual(a, b);

    if (matches) {
      await prisma.emailOtp.update({
        where: { id: otp.id },
        data: { consumed: true },
      });
    }

    return matches;
  }

  /**
   * Clean up expired OTPs (call from cron or background job).
   */
  async cleanupExpired(): Promise<number> {
    const result = await prisma.emailOtp.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    return result.count;
  }
}

export const otpService = new OtpService();
