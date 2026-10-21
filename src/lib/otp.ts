import crypto from "crypto";
import { prisma } from "./prisma";

// Expiry and cooldown constants
export const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
export const OTP_RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds
export const MAX_INCORRECT_ATTEMPTS = 5;

// Rate limiting thresholds
export const MAX_OTP_PER_EMAIL_PER_HOUR = 5;
export const MAX_OTP_PER_IP_PER_HOUR = 10;
export const MAX_FAILED_VERIFICATIONS_PER_IP_WINDOW = 10;
export const FAILED_VERIFICATION_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

const HMAC_SECRET = process.env.JWT_SECRET || "nimblux_secure_otp_salt_2026";

/**
 * Validates and normalizes an email address.
 * Returns normalized email or null if invalid.
 */
export function normalizeEmail(email: string): string | null {
  if (!email || typeof email !== "string") return null;

  const trimmed = email.trim().toLowerCase();

  // Standard RFC compliant email regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  if (!emailRegex.test(trimmed)) {
    return null;
  }

  // Reject overly long email addresses
  if (trimmed.length > 254) {
    return null;
  }

  return trimmed;
}

/**
 * Generates a cryptographically secure random 6-digit OTP string.
 */
export function generateSecureOtp(): string {
  // crypto.randomInt is cryptographically strong (uses CSPRNG)
  const code = crypto.randomInt(100000, 1000000);
  return code.toString();
}

/**
 * Computes an HMAC-SHA256 hash of the OTP salted with the normalized email and server secret.
 * This ensures that even if an attacker reads the database, a 6-digit OTP cannot be reverse-computed.
 */
export function hashOtp(normalizedEmail: string, otp: string): string {
  return crypto
    .createHmac("sha256", HMAC_SECRET)
    .update(`${normalizedEmail}:${otp.trim()}`)
    .digest("hex");
}

/**
 * Constant-time comparison between the user-supplied OTP and the stored hash.
 * Prevents timing side-channel attacks.
 */
export function timingSafeOtpCompare(normalizedEmail: string, inputOtp: string, storedHash: string): boolean {
  if (!inputOtp || !storedHash) return false;

  const computedHash = hashOtp(normalizedEmail, inputOtp);
  if (computedHash.length !== storedHash.length) return false;

  const bufA = Buffer.from(computedHash, "hex");
  const bufB = Buffer.from(storedHash, "hex");

  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Extracts the real client IP address from request headers.
 */
export function getClientIp(headers: Headers): string {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  const realIp = headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  const cfConnectingIp = headers.get("cf-connecting-ip");
  if (cfConnectingIp) {
    return cfConnectingIp.trim();
  }
  return "127.0.0.1";
}

export interface RateLimitCheckResult {
  allowed: boolean;
  reason?: string;
  retryAfterSeconds?: number;
}

/**
 * Checks all abuse protection rules:
 * 1. Resend cooldown (minimum 60s between OTP generation for same email)
 * 2. Hourly rate limit per email (max 5)
 * 3. Hourly rate limit per IP address (max 10)
 */
export async function checkOtpSendRateLimits(
  normalizedEmail: string,
  clientIp: string
): Promise<RateLimitCheckResult> {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  // 1. Check for active cooldown on this email
  const latestVerification = await prisma.emailVerification.findFirst({
    where: {
      email: normalizedEmail,
      verifiedAt: null,
    },
    orderBy: { createdAt: "desc" },
  });

  if (latestVerification) {
    const resendAllowedAt = new Date(latestVerification.resendAfter);
    if (now < resendAllowedAt) {
      const waitSeconds = Math.ceil((resendAllowedAt.getTime() - now.getTime()) / 1000);
      return {
        allowed: false,
        reason: `Please wait ${waitSeconds} seconds before requesting a new verification code.`,
        retryAfterSeconds: waitSeconds,
      };
    }
  }

  // 2. Check hourly limit for this email
  const emailHourlyCount = await prisma.emailVerification.count({
    where: {
      email: normalizedEmail,
      createdAt: { gte: oneHourAgo },
    },
  });

  if (emailHourlyCount >= MAX_OTP_PER_EMAIL_PER_HOUR) {
    return {
      allowed: false,
      reason: "Too many verification requests for this email. Please try again in an hour.",
      retryAfterSeconds: 3600,
    };
  }

  // 3. Check hourly limit for this IP address (if IP is available)
  if (clientIp && clientIp !== "127.0.0.1") {
    const ipHourlyCount = await prisma.emailVerification.count({
      where: {
        ipAddress: clientIp,
        createdAt: { gte: oneHourAgo },
      },
    });

    if (ipHourlyCount >= MAX_OTP_PER_IP_PER_HOUR) {
      return {
        allowed: false,
        reason: "Too many verification requests from your network. Please try again in an hour.",
        retryAfterSeconds: 3600,
      };
    }
  }

  return { allowed: true };
}

/**
 * Checks IP brute force protection against verification guessing attempts.
 */
export async function checkVerificationBruteForce(clientIp: string): Promise<boolean> {
  if (!clientIp || clientIp === "127.0.0.1") return true;

  const windowStart = new Date(Date.now() - FAILED_VERIFICATION_WINDOW_MS);

  const failedCount = await prisma.verificationAttempt.count({
    where: {
      ipAddress: clientIp,
      success: false,
      createdAt: { gte: windowStart },
    },
  });

  return failedCount < MAX_FAILED_VERIFICATIONS_PER_IP_WINDOW;
}

/**
 * Creates and stores a new OTP in the database, invalidating previous codes for this email.
 */
export async function issueOtpRecord(params: {
  normalizedEmail: string;
  otp: string;
  clientIp?: string;
  userAgent?: string;
}) {
  const { normalizedEmail, otp, clientIp, userAgent } = params;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + OTP_EXPIRY_MS);
  const resendAfter = new Date(now.getTime() + OTP_RESEND_COOLDOWN_MS);
  const otpHash = hashOtp(normalizedEmail, otp);

  // Invalidate any existing pending OTPs for this email by expiring them
  await prisma.emailVerification.updateMany({
    where: {
      email: normalizedEmail,
      verifiedAt: null,
      expiresAt: { gt: now },
    },
    data: {
      expiresAt: now, // immediately expired
    },
  });

  // Create new active OTP record
  const record = await prisma.emailVerification.create({
    data: {
      email: normalizedEmail,
      otpHash,
      attempts: 0,
      maxAttempts: MAX_INCORRECT_ATTEMPTS,
      expiresAt,
      resendAfter,
      ipAddress: clientIp || null,
      userAgent: userAgent || null,
    },
  });

  return record;
}
