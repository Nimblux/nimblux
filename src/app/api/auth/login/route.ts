import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword, signJwt, AUTH_COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    if (user.status === "SUSPENDED") {
      return NextResponse.json(
        { error: "Your account has been suspended. Contact support@nimblux.com." },
        { status: 403 }
      );
    }

    if (!user.passwordHash) {
      return NextResponse.json(
        { error: "This account was signed up using Google. Please click 'Continue with Google' to sign in." },
        { status: 400 }
      );
    }

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const token = signJwt({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        status: user.status,
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
      { error: error.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
