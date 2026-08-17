import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const currentUser = await getCurrentUser();

    // Lookup by ID or by slug
    const opportunity = await prisma.opportunity.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        createdBy: {
          select: { id: true, name: true, profileImage: true, college: true },
        },
      },
    });

    if (!opportunity) {
      return NextResponse.json(
        { error: "Opportunity not found" },
        { status: 404 }
      );
    }

    // Increment view count in background
    await prisma.opportunity.update({
      where: { id: opportunity.id },
      data: { viewsCount: { increment: 1 } },
    });

    let isBookmarked = false;
    if (currentUser) {
      const bookmark = await prisma.bookmark.findUnique({
        where: {
          userId_opportunityId: {
            userId: currentUser.id,
            opportunityId: opportunity.id,
          },
        },
      });
      isBookmarked = Boolean(bookmark);
    }

    // Also get related opportunities in same category
    const related = await prisma.opportunity.findMany({
      where: {
        category: opportunity.category,
        status: "APPROVED",
        id: { not: opportunity.id },
      },
      take: 3,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      opportunity: {
        ...opportunity,
        isBookmarked,
      },
      related,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch opportunity." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const existing = await prisma.opportunity.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Only owner or admin can edit
    if (existing.createdById !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    // If a regular user updates a rejected listing, set it back to PENDING for re-review!
    let statusUpdate = existing.status;
    if (user.role !== "ADMIN" && existing.status === "REJECTED") {
      statusUpdate = "PENDING";
    }

    const updated = await prisma.opportunity.update({
      where: { id },
      data: {
        title: body.title !== undefined ? body.title : existing.title,
        description: body.description !== undefined ? body.description : existing.description,
        category: body.category !== undefined ? body.category.toLowerCase() : existing.category,
        organization: body.organization !== undefined ? body.organization : existing.organization,
        location: body.location !== undefined ? body.location : existing.location,
        mode: body.mode !== undefined ? body.mode.toUpperCase() : existing.mode,
        eligibility: body.eligibility !== undefined ? body.eligibility : existing.eligibility,
        skills: body.skills !== undefined ? body.skills : existing.skills,
        stipend: body.stipend !== undefined ? body.stipend : existing.stipend,
        salary: body.salary !== undefined ? body.salary : existing.salary,
        applicationUrl: body.applicationUrl !== undefined ? body.applicationUrl : existing.applicationUrl,
        deadline: body.deadline ? new Date(body.deadline) : existing.deadline,
        status: statusUpdate,
        rejectionReason: statusUpdate === "PENDING" ? null : existing.rejectionReason,
      },
    });

    return NextResponse.json({ success: true, opportunity: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const existing = await prisma.opportunity.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (existing.createdById !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.opportunity.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Opportunity deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
