import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      orderBy: { eventDate: "asc" },
    });
    return NextResponse.json({ events });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { title, description, banner, eventDate, location, mode, registrationUrl, organizer, isFeatured } = body;

    if (!title || !description || !eventDate || !registrationUrl) {
      return NextResponse.json({ error: "Missing required event fields" }, { status: 400 });
    }

    let baseSlug = slugify(title);
    let uniqueSlug = baseSlug;
    let count = 1;
    while (await prisma.event.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${baseSlug}-${count++}`;
    }

    const event = await prisma.event.create({
      data: {
        title: title.trim(),
        slug: uniqueSlug,
        description: description.trim(),
        banner: banner?.trim() || null,
        eventDate: new Date(eventDate),
        location: location?.trim() || "Virtual",
        mode: (mode || "REMOTE").toUpperCase(),
        registrationUrl: registrationUrl.trim(),
        organizer: organizer?.trim() || "NIMBLUX",
        isFeatured: Boolean(isFeatured),
      },
    });

    return NextResponse.json({ success: true, event });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json({ error: "Event ID required" }, { status: 400 });
    }

    await prisma.event.delete({ where: { id: eventId } });
    return NextResponse.json({ success: true, message: "Event deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
