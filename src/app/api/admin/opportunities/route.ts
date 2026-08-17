import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status"); // "ALL", "PENDING", "APPROVED", "REJECTED"
    const category = searchParams.get("category");
    const q = searchParams.get("q");

    const where: any = {};

    if (status && status !== "ALL") {
      where.status = status.toUpperCase();
    }

    if (category && category !== "all") {
      where.category = category.toLowerCase();
    }

    if (q && q.trim()) {
      const term = q.trim().toLowerCase();
      where.OR = [
        { title: { contains: term } },
        { organization: { contains: term } },
        { createdBy: { name: { contains: term } } },
        { createdBy: { email: { contains: term } } },
      ];
    }

    const opportunities = await prisma.opportunity.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true, profileImage: true },
        },
        approvedBy: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json({ opportunities });
  } catch (error: any) {
    if (error.message === "FORBIDDEN_ADMIN_REQUIRED" || error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
