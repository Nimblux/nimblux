import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();

    const opportunity = await prisma.opportunity.findUnique({
      where: { id: params.id },
      select: { id: true, createdById: true },
    });

    if (!opportunity) {
      return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
    }

    if (opportunity.createdById !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const registrations = await prisma.opportunityRegistration.findMany({
      where: { opportunityId: params.id },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
            college: true,
            degree: true,
            graduationYear: true,
            githubUrl: true,
            linkedinUrl: true,
            portfolioUrl: true,
            skills: true,
            phone: true,
          },
        },
      },
    });

    return NextResponse.json({ registrations });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch registrations" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();

    const opportunity = await prisma.opportunity.findUnique({
      where: { id: params.id },
      select: { id: true, createdById: true },
    });

    if (!opportunity) {
      return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
    }

    if (opportunity.createdById !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { registrationId, status, attendanceMarked, progress } = body;

    if (!registrationId) {
      return NextResponse.json({ error: "Registration ID required" }, { status: 400 });
    }

    const updated = await prisma.opportunityRegistration.update({
      where: { id: registrationId },
      data: {
        status: status || undefined,
        attendanceMarked: attendanceMarked !== undefined ? attendanceMarked : undefined,
        progress: progress !== undefined ? progress : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      registration: updated,
      message: "Registration updated successfully.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update registration" },
      { status: 500 }
    );
  }
}
