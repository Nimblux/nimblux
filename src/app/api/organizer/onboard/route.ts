import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "You must be signed in to become an organizer." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      organizationName,
      organizationLogo,
      organizationBio,
      organizationWebsite,
      organizationEmail,
      organizationPhone,
      organizationLocation,
      organizationType,
      organizationLinkedin,
      organizationTwitter,
      organizationGithub,
    } = body;

    if (!organizationName || !organizationName.trim()) {
      return NextResponse.json(
        { error: "Organization name is required." },
        { status: 400 }
      );
    }

    // Update user to activate Organizer Workspace
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        isOrganizer: true,
        organizationName: organizationName.trim(),
        organizationLogo: organizationLogo?.trim() || null,
        organizationBio: organizationBio?.trim() || null,
        organizationWebsite: organizationWebsite?.trim() || null,
        organizationEmail: organizationEmail?.trim() || user.email,
        organizationPhone: organizationPhone?.trim() || null,
        organizationLocation: organizationLocation?.trim() || null,
        organizationType: organizationType?.trim() || "COMPANY",
        organizationLinkedin: organizationLinkedin?.trim() || null,
        organizationTwitter: organizationTwitter?.trim() || null,
        organizationGithub: organizationGithub?.trim() || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isOrganizer: true,
        isVerifiedOrganizer: true,
        organizationName: true,
        organizationLogo: true,
      },
    });

    // Send onboarding confirmation notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: "Organizer Workspace Activated! 🚀",
        message: `Welcome to NIMBLUX Organizer, ${organizationName.trim()}. You can now publish opportunities, review applicants, and host hackathons.`,
        type: "SYSTEM",
        link: "/organizer",
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: "Organizer Workspace successfully activated!",
    });
  } catch (error: any) {
    console.error("Organizer onboarding error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to activate organizer workspace." },
      { status: 500 }
    );
  }
}
