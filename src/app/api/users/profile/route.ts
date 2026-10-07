import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        profileImage: true,
        profileImageUrl: true,
        college: true,
        degree: true,
        skills: true,
        graduationYear: true,
        location: true,
        bio: true,
        githubUrl: true,
        linkedinUrl: true,
        portfolioUrl: true,
        phone: true,
        googleId: true,
        authProvider: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const latestApp = await prisma.opportunityApplication.findFirst({
      where: { userId: sessionUser.id, resumeUrl: { not: null } },
      orderBy: { createdAt: "desc" },
      select: { resumeUrl: true },
    });

    const resolvedImage = user.profileImageUrl || user.profileImage || null;

    return NextResponse.json({
      user: {
        ...user,
        profileImage: resolvedImage,
        profileImageUrl: resolvedImage,
        resumeUrl: latestApp?.resumeUrl || null,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      profileImage,
      profileImageUrl,
      college,
      degree,
      skills,
      graduationYear,
      location,
      bio,
      githubUrl,
      linkedinUrl,
      portfolioUrl,
      phone,
    } = body;

    const newImage = (profileImageUrl || profileImage)?.trim() || null;

    const updated = await prisma.user.update({
      where: { id: sessionUser.id },
      data: {
        name: name !== undefined ? name.trim() : undefined,
        profileImage: profileImage !== undefined || profileImageUrl !== undefined ? newImage : undefined,
        profileImageUrl: profileImage !== undefined || profileImageUrl !== undefined ? newImage : undefined,
        college: college !== undefined ? college?.trim() || null : undefined,
        degree: degree !== undefined ? degree?.trim() || null : undefined,
        skills: skills !== undefined ? skills?.trim() || null : undefined,
        graduationYear: graduationYear !== undefined ? graduationYear?.trim() || null : undefined,
        location: location !== undefined ? location?.trim() || null : undefined,
        bio: bio !== undefined ? bio?.trim() || null : undefined,
        githubUrl: githubUrl !== undefined ? githubUrl?.trim() || null : undefined,
        linkedinUrl: linkedinUrl !== undefined ? linkedinUrl?.trim() || null : undefined,
        portfolioUrl: portfolioUrl !== undefined ? portfolioUrl?.trim() || null : undefined,
        phone: phone !== undefined ? phone?.trim() || null : undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        profileImage: true,
        profileImageUrl: true,
        college: true,
        degree: true,
        skills: true,
        graduationYear: true,
        location: true,
        bio: true,
        githubUrl: true,
        linkedinUrl: true,
        portfolioUrl: true,
        phone: true,
        googleId: true,
        authProvider: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        ...updated,
        profileImage: updated.profileImageUrl || updated.profileImage || null,
        profileImageUrl: updated.profileImageUrl || updated.profileImage || null,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
