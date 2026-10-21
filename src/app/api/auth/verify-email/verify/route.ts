import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signJwt, AUTH_COOKIE_NAME } from "@/lib/auth";
import {
  normalizeEmail,
  timingSafeOtpCompare,
  getClientIp,
  checkVerificationBruteForce,
} from "@/lib/otp";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, otp } = body;

    const normalized = normalizeEmail(email);
    if (!normalized) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    if (!otp || typeof otp !== "string" || !/^\d{6}$/.test(otp.trim())) {
      return NextResponse.json(
        { error: "Please enter a valid 6-digit verification code." },
        { status: 400 }
      );
    }

    const cleanOtp = otp.trim();
    const clientIp = getClientIp(req.headers);

    // IP Brute-Force Abuse Protection
    const isIpAllowed = await checkVerificationBruteForce(clientIp);
    if (!isIpAllowed) {
      return NextResponse.json(
        { error: "Too many failed verification attempts from your network. Please wait 15 minutes before trying again." },
        { status: 429 }
      );
    }

    // Find the latest active, unverified OTP record for this email
    const verification = await prisma.emailVerification.findFirst({
      where: {
        email: normalized,
        verifiedAt: null,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!verification) {
      await prisma.verificationAttempt.create({
        data: { ipAddress: clientIp, email: normalized, success: false },
      }).catch(() => {});

      return NextResponse.json(
        { error: "No active verification code found for this email. Please request a new code." },
        { status: 400 }
      );
    }

    // Check expiry (10 minutes)
    const now = new Date();
    if (now > new Date(verification.expiresAt)) {
      await prisma.verificationAttempt.create({
        data: { ipAddress: clientIp, email: normalized, success: false },
      }).catch(() => {});

      return NextResponse.json(
        { error: "Verification code has expired. Please request a new code." },
        { status: 400 }
      );
    }

    // Check max attempts
    if (verification.attempts >= verification.maxAttempts) {
      await prisma.verificationAttempt.create({
        data: { ipAddress: clientIp, email: normalized, success: false },
      }).catch(() => {});

      return NextResponse.json(
        { error: "Too many incorrect attempts. For security reasons, this code has been invalidated. Please request a new code." },
        { status: 400 }
      );
    }

    // Verify OTP timing-safely against hash
    const isValid = timingSafeOtpCompare(normalized, cleanOtp, verification.otpHash);

    if (!isValid) {
      const updatedRecord = await prisma.emailVerification.update({
        where: { id: verification.id },
        data: { attempts: { increment: 1 } },
      });

      await prisma.verificationAttempt.create({
        data: { ipAddress: clientIp, email: normalized, success: false },
      }).catch(() => {});

      const remainingAttempts = verification.maxAttempts - updatedRecord.attempts;

      if (remainingAttempts <= 0) {
        return NextResponse.json(
          { error: "Invalid verification code. This code has exceeded the maximum attempts and is now invalidated. Please request a new code." },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          error: `Invalid verification code. ${remainingAttempts} ${
            remainingAttempts === 1 ? "attempt" : "attempts"
          } remaining.`,
          remainingAttempts,
        },
        { status: 400 }
      );
    }

    // Successfully verified!
    // 1. Mark OTP as verified (invalidate used code against replay attacks)
    await prisma.emailVerification.update({
      where: { id: verification.id },
      data: { verifiedAt: now },
    });

    // 2. Log successful verification attempt
    await prisma.verificationAttempt.create({
      data: { ipAddress: clientIp, email: normalized, success: true },
    }).catch(() => {});

    // 3. Find and activate user
    let user = await prisma.user.findUnique({
      where: { email: normalized },
    });

    if (!user) {
      // In case user record was not pre-created
      user = await prisma.user.create({
        data: {
          name: normalized.split("@")[0],
          email: normalized,
          role: "USER",
          status: "ACTIVE",
          emailVerified: true,
          emailVerifiedAt: now,
        },
      });
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          status: "ACTIVE",
          emailVerified: true,
          emailVerifiedAt: now,
        },
      });
    }

    // 4. Create welcome notification if not already existing
    const existingNotification = await prisma.notification.findFirst({
      where: { userId: user.id, type: "SYSTEM" },
    });

    if (!existingNotification) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: "Welcome to NIMBLUX! 🎉",
          message: "Your student account is verified and active. Discover verified internships, hackathons, and scholarships curated for you.",
          type: "SYSTEM",
          link: "/opportunities",
        },
      }).catch(() => {});
    }

    // 5. Sign JWT token and set session cookie
    const token = signJwt({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      message: "Email successfully verified!",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        status: user.status,
        emailVerified: user.emailVerified,
        phone: user.phone,
        college: user.college,
        degree: user.degree,
        graduationYear: user.graduationYear,
        skills: user.skills,
        githubUrl: user.githubUrl,
        linkedinUrl: user.linkedinUrl,
        portfolioUrl: user.portfolioUrl,
        location: user.location,
      },
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: "An unexpected error occurred while verifying the code." },
      { status: 500 }
    );
  }
}
