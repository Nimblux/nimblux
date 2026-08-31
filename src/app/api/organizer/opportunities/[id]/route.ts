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
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: {
            applications: true,
            registrations: true,
            announcements: true,
            certificates: true,
            bookmarks: true,
          },
        },
      },
    });

    if (!opportunity) {
      return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
    }

    if (opportunity.createdById !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Not organizer" }, { status: 403 });
    }

    return NextResponse.json({ opportunity });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: error.message || "Failed to fetch opportunity" },
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
    });

    if (!opportunity) {
      return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
    }

    if (opportunity.createdById !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Not organizer" }, { status: 403 });
    }

    const body = await req.json();

    const updated = await prisma.opportunity.update({
      where: { id: params.id },
      data: {
        ...body,
        deadline: body.deadline ? new Date(body.deadline) : undefined,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      opportunity: updated,
      message: "Opportunity updated successfully.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update opportunity" },
      { status: 500 }
    );
  }
}
