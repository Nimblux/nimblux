import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();

    const applications = await prisma.opportunityApplication.findMany({
      where: { userId: user.id },
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
            logo: true,
            banner: true,
            location: true,
            mode: true,
            deadline: true,
            startDate: true,
            stipend: true,
            salary: true,
            status: true,
          },
        },
      },
    });

    return NextResponse.json({ applications });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: error.message || "Failed to fetch applications" },
      { status: 500 }
    );
  }
}
