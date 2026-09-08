import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orgData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        isOrganizer: true,
        isVerifiedOrganizer: true,
        organizationName: true,
        organizationLogo: true,
        organizationBio: true,
        organizationWebsite: true,
        organizationEmail: true,
        organizationPhone: true,
        organizationLocation: true,
        organizationType: true,
        organizationLinkedin: true,
        organizationTwitter: true,
        organizationGithub: true,
      },
    });

    return NextResponse.json({ organization: orgData });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch organization." },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        organizationName: organizationName?.trim() || user.organizationName,
        organizationLogo: organizationLogo?.trim() || null,
        organizationBio: organizationBio?.trim() || null,
        organizationWebsite: organizationWebsite?.trim() || null,
        organizationEmail: organizationEmail?.trim() || user.organizationEmail || user.email,
        organizationPhone: organizationPhone?.trim() || null,
        organizationLocation: organizationLocation?.trim() || null,
        organizationType: organizationType?.trim() || "COMPANY",
        organizationLinkedin: organizationLinkedin?.trim() || null,
        organizationTwitter: organizationTwitter?.trim() || null,
        organizationGithub: organizationGithub?.trim() || null,
      },
      select: {
        id: true,
        isOrganizer: true,
        isVerifiedOrganizer: true,
        organizationName: true,
        organizationLogo: true,
        organizationBio: true,
        organizationWebsite: true,
        organizationEmail: true,
        organizationPhone: true,
        organizationLocation: true,
        organizationType: true,
        organizationLinkedin: true,
        organizationTwitter: true,
        organizationGithub: true,
      },
    });

    return NextResponse.json({
      success: true,
      organization: updated,
      message: "Organization profile updated successfully!",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update organization." },
      { status: 500 }
    );
  }
}
