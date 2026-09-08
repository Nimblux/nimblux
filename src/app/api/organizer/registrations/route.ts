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
    const query = searchParams.get("q")?.toLowerCase();

    const isFullAdmin = user.role === "ADMIN";

    const whereClause: any = {
      opportunity: isFullAdmin ? {} : { createdById: user.id },
    };

    if (opportunityId && opportunityId !== "ALL") {
      whereClause.opportunityId = opportunityId;
    }

    if (query) {
      whereClause.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
        { college: { contains: query, mode: "insensitive" } },
      ];
    }

    const [registrations, opportunities] = await Promise.all([
      prisma.opportunityRegistration.findMany({
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
              startDate: true,
              location: true,
            },
          },
        },
      }),
      prisma.opportunity.findMany({
        where: {
          ...(isFullAdmin ? {} : { createdById: user.id }),
          opportunityType: { in: ["WORKSHOP", "EVENT", "COURSE", "BOOTCAMP", "WEBINAR", "CONFERENCE"] },
        },
        select: {
          id: true,
          title: true,
          slug: true,
          opportunityType: true,
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return NextResponse.json({ registrations, opportunities });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch registrations." },
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
    const { registrationId, attendanceMarked, status } = body;

    if (!registrationId) {
      return NextResponse.json({ error: "Registration ID is required" }, { status: 400 });
    }

    const reg = await prisma.opportunityRegistration.findUnique({
      where: { id: registrationId },
      include: { opportunity: true },
    });

    if (!reg) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    }

    if (reg.opportunity.createdById !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.opportunityRegistration.update({
      where: { id: registrationId },
      data: {
        ...(attendanceMarked !== undefined ? { attendanceMarked } : {}),
        ...(status ? { status } : {}),
      },
    });

    return NextResponse.json({ success: true, registration: updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update registration." },
      { status: 500 }
    );
  }
}
