import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { sendOtpEmail } from "@/lib/email";
import {
  normalizeEmail,
  generateSecureOtp,
  getClientIp,
  checkOtpSendRateLimits,
  issueOtpRecord,
} from "@/lib/otp";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, name, password, college, degree, graduationYear } = body;

    const normalized = normalizeEmail(email);
    if (!normalized) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    // Prevent duplicate active accounts & account enumeration safety
    const existingUser = await prisma.user.findUnique({
      where: { email: normalized },
    });

    if (existingUser && existingUser.status === "ACTIVE") {
      return NextResponse.json(
        { error: "An account with this email already exists. Please sign in instead." },
        { status: 400 }
      );
    }

    if (existingUser && existingUser.status === "SUSPENDED") {
      return NextResponse.json(
        { error: "This account has been suspended. Please contact support." },
        { status: 403 }
      );
    }

    const clientIp = getClientIp(req.headers);
    const userAgent = req.headers.get("user-agent") || undefined;

    // Rate limiting & abuse protection
    const rateLimit = await checkOtpSendRateLimits(normalized, clientIp);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: rateLimit.reason,
          retryAfter: rateLimit.retryAfterSeconds,
        },
        { status: 429 }
      );
    }

    // If password provided in registration payload, prepare/update the pending user record
    if (password) {
      if (typeof password !== "string" || password.length < 6) {
        return NextResponse.json(
          { error: "Password must be at least 6 characters long." },
          { status: 400 }
        );
      }

      const passwordHash = await hashPassword(password);
      const safeName = (name || normalized.split("@")[0]).trim();

      if (existingUser && existingUser.status === "PENDING_VERIFICATION") {
        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            name: safeName,
            passwordHash,
            college: college?.trim() || null,
            degree: degree?.trim() || null,
            graduationYear: graduationYear?.trim() || null,
          },
        });
      } else if (!existingUser) {
        await prisma.user.create({
          data: {
            name: safeName,
            email: normalized,
            passwordHash,
            role: "USER",
            college: college?.trim() || null,
            degree: degree?.trim() || null,
            graduationYear: graduationYear?.trim() || null,
            status: "PENDING_VERIFICATION",
            emailVerified: false,
          },
        });
      }
    }

    // Generate cryptographically secure 6-digit OTP
    const otp = generateSecureOtp();

    // Store hashed OTP in database
    const otpRecord = await issueOtpRecord({
      normalizedEmail: normalized,
      otp,
      clientIp,
      userAgent,
    });

    // Send the email via Hostinger SMTP
    const recipientName = name || existingUser?.name || undefined;
    const emailResult = await sendOtpEmail({
      to: normalized,
      otp,
      name: recipientName,
    });

    if (!emailResult.success) {
      // Invalidate the OTP record so the user is not unfairly penalized with a cooldown
      await prisma.emailVerification.delete({
        where: { id: otpRecord.id },
      }).catch(() => {});

      return NextResponse.json(
        {
          error: emailResult.error || "Failed to deliver verification code. Please check your email or try again.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Verification code sent to ${normalized}.`,
      email: normalized,
      cooldownSeconds: 60,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "An unexpected error occurred while processing your request." },
      { status: 500 }
    );
  }
}
