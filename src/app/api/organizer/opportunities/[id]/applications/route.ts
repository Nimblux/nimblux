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

    const applications = await prisma.opportunityApplication.findMany({
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
          },
        },
      },
    });

    return NextResponse.json({ applications });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch applications" },
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
      select: { id: true, title: true, organization: true, createdById: true },
    });

    if (!opportunity) {
      return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
    }

    if (opportunity.createdById !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { applicationId, status, notes, rating, rejectionReason } = body;

    if (!applicationId) {
      return NextResponse.json({ error: "Application ID required" }, { status: 400 });
    }

    const updated = await prisma.opportunityApplication.update({
      where: { id: applicationId },
      data: {
        status: status || undefined,
        notes: notes !== undefined ? notes : undefined,
        rating: rating !== undefined ? rating : undefined,
        rejectionReason: rejectionReason !== undefined ? rejectionReason : undefined,
      },
    });

    // Notify candidate if status changed
    if (status) {
      const statusTitleMap: Record<string, string> = {
        SHORTLISTED: "Application Shortlisted! ⭐",
        INTERVIEW: "Interview Round Invitation 📞",
        SELECTED: "Congratulations! You are Selected 🎉",
        REJECTED: "Application Status Update",
        UNDER_REVIEW: "Application Under Review ⏳",
      };

      const statusMsgMap: Record<string, string> = {
        SHORTLISTED: `Great news! You have been shortlisted for "${opportunity.title}" at ${opportunity.organization}.`,
        INTERVIEW: `You have been selected for an interview for "${opportunity.title}". Check your dashboard for details.`,
        SELECTED: `Congratulations! You have been selected for "${opportunity.title}" at ${opportunity.organization}.`,
        REJECTED: `Thank you for applying to "${opportunity.title}". Your application status has been updated.`,
        UNDER_REVIEW: `Your application for "${opportunity.title}" is currently being reviewed by the hiring team.`,
      };

      await prisma.notification.create({
        data: {
          userId: updated.userId,
          title: statusTitleMap[status] || "Application Update",
          message: statusMsgMap[status] || `Your application status for "${opportunity.title}" is now ${status}.`,
          type: "OPPORTUNITY",
          link: "/dashboard/applications",
        },
      });
    }

    return NextResponse.json({
      success: true,
      application: updated,
      message: "Application updated successfully.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update application" },
      { status: 500 }
    );
  }
}
