import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const where: any = {};
    if (status && status !== "ALL") {
      where.status = status.toUpperCase();
    }

    const hackathons = await prisma.hackathon.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true, profileImage: true },
        },
        _count: {
          select: {
            registrations: true,
            teams: true,
            submissions: true,
            winners: true,
          },
        },
      },
    });

    return NextResponse.json({ hackathons, count: hackathons.length });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch hackathons." },
      { status: error.message?.includes("FORBIDDEN") ? 403 : 500 }
    );
  }
}
