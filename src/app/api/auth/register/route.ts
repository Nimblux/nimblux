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
    const { name, email, password, college, degree, graduationYear } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
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

    // Check rate limits & cooldowns
    const rateLimit = await checkOtpSendRateLimits(normalizedEmail, clientIp);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: rateLimit.reason,
          retryAfter: rateLimit.retryAfterSeconds,
        },
        { status: 429 }
      );
    }

    const passwordHash = await hashPassword(password);
    const safeName = name.trim();

    // Create or update pending user record
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
          email: normalizedEmail,
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

    // Generate cryptographically secure 6-digit OTP
    const otp = generateSecureOtp();

    // Store hashed OTP in database
    const otpRecord = await issueOtpRecord({
      normalizedEmail,
      otp,
      clientIp,
      userAgent,
    });

    // Send verification email via Hostinger SMTP
    const emailResult = await sendOtpEmail({
      to: normalizedEmail,
      otp,
      name: safeName,
    });

    if (!emailResult.success) {
      // Clean up OTP record so user is not blocked from retrying
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
      requiresVerification: true,
      email: normalizedEmail,
      message: `Verification code sent to ${normalizedEmail}.`,
      cooldownSeconds: 60,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "An unexpected error occurred during registration." },
      { status: 500 }
    );
  }
}
