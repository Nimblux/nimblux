import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const hackathon = await prisma.hackathon.findFirst({
      where: { OR: [{ id: params.id }, { slug: params.id }] },
    });

    if (!hackathon) {
      return NextResponse.json({ error: "Hackathon not found." }, { status: 404 });
    }

    const announcements = await prisma.hackathonAnnouncement.findMany({
      where: { hackathonId: hackathon.id },
      orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ announcements, count: announcements.length });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch announcements." },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const hackathon = await prisma.hackathon.findFirst({
      where: { OR: [{ id: params.id }, { slug: params.id }] },
    });

    if (!hackathon) return NextResponse.json({ error: "Hackathon not found." }, { status: 404 });

    if (hackathon.createdById !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Only the organizer can post announcements." }, { status: 403 });
    }

    const body = await req.json();
    const { title, content, type = "GENERAL", pinned = false } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required." }, { status: 400 });
    }

    const announcement = await prisma.hackathonAnnouncement.create({
      data: {
        hackathonId: hackathon.id,
        title: title.trim(),
        content: content.trim(),
        type,
        pinned: Boolean(pinned),
      },
    });

    // Notify registered participants
    const registrations = await prisma.hackathonRegistration.findMany({
      where: { hackathonId: hackathon.id },
      select: { userId: true },
    });

    for (const reg of registrations) {
      await prisma.notification.create({
        data: {
          userId: reg.userId,
          title: `Announcement: ${title}`,
          message: `${hackathon.title}: ${content.slice(0, 120)}...`,
          type: "HACKATHON",
          link: `/hackathon/${hackathon.slug}`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      announcement,
      message: "Announcement posted and broadcast to participants.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to post announcement." },
      { status: 500 }
    );
  }
}
