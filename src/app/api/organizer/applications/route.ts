import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const opportunityId = searchParams.get("opportunityId");
    const status = searchParams.get("status");
    const query = searchParams.get("q")?.toLowerCase();

    const isFullAdmin = user.role === "ADMIN";

    const whereClause: any = {
      opportunity: isFullAdmin ? {} : { createdById: user.id },
    };

    if (opportunityId && opportunityId !== "ALL") {
      whereClause.opportunityId = opportunityId;
    }

    if (status && status !== "ALL") {
      whereClause.status = status;
    }

    if (query) {
      whereClause.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
        { college: { contains: query, mode: "insensitive" } },
        { skills: { contains: query, mode: "insensitive" } },
      ];
    }

    const [applications, opportunities] = await Promise.all([
      prisma.opportunityApplication.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        include: {
          opportunity: {
            select: {
              id: true,
              title: true,
              slug: true,
              category: true,
              opportunityType: true,
              organization: true,
            },
          },
        },
      }),
      prisma.opportunity.findMany({
        where: isFullAdmin ? {} : { createdById: user.id },
        select: {
          id: true,
          title: true,
          slug: true,
          opportunityType: true,
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return NextResponse.json({ applications, opportunities });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch applications." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { applicationId, status, rating, notes, rejectionReason } = body;

    if (!applicationId) {
      return NextResponse.json({ error: "Application ID is required" }, { status: 400 });
    }

    // Verify ownership
    const app = await prisma.opportunityApplication.findUnique({
      where: { id: applicationId },
      include: { opportunity: true },
    });

    if (!app) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    if (app.opportunity.createdById !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden. You do not own this opportunity." }, { status: 403 });
    }

    const updated = await prisma.opportunityApplication.update({
      where: { id: applicationId },
      data: {
        ...(status ? { status } : {}),
        ...(rating !== undefined ? { rating } : {}),
        ...(notes !== undefined ? { notes } : {}),
        ...(rejectionReason !== undefined ? { rejectionReason } : {}),
      },
    });

    // Notify candidate on status changes
    if (status && status !== app.status) {
      await prisma.notification.create({
        data: {
          userId: app.userId,
          title: `Application Update: ${app.opportunity.title}`,
          message: `Your application status has been updated to: ${status.replace("_", " ")}.`,
          type: "OPPORTUNITY",
          link: `/dashboard/applications`,
        },
      }).catch(() => {});
    }

    return NextResponse.json({ success: true, application: updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update application." },
      { status: 500 }
    );
  }
}
