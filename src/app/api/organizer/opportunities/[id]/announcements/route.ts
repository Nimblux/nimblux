import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const announcements = await prisma.opportunityAnnouncement.findMany({
      where: { opportunityId: params.id },
      orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ announcements });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch announcements" },
      { status: 500 }
    );
  }
}

export async function POST(
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
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { title, content, target, pinned } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required." },
        { status: 400 }
      );
    }

    const announcement = await prisma.opportunityAnnouncement.create({
      data: {
        opportunityId: params.id,
        title: title.trim(),
        content: content.trim(),
        target: target || "ALL",
        pinned: Boolean(pinned),
      },
    });

    // Broadcast in-platform notification to participants
    const [registrations, applications] = await Promise.all([
      prisma.opportunityRegistration.findMany({
        where: { opportunityId: params.id, status: { not: "CANCELLED" } },
        select: { userId: true },
      }),
      prisma.opportunityApplication.findMany({
        where: { opportunityId: params.id },
        select: { userId: true },
      }),
    ]);

    const recipientIds = new Set<string>();
    registrations.forEach((r) => recipientIds.add(r.userId));
    applications.forEach((a) => recipientIds.add(a.userId));

    const recipientIdsList = Array.from(recipientIds);

    for (const rUserId of recipientIdsList) {
      await prisma.notification.create({
        data: {
          userId: rUserId,
          title: `Announcement: ${title} 📢`,
          message: `${opportunity.organization}: ${content.slice(0, 120)}...`,
          type: "OPPORTUNITY",
          link: `/opportunity/${opportunity.slug}`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      announcement,
      message: "Announcement broadcasted successfully!",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to broadcast announcement" },
      { status: 500 }
    );
  }
}
