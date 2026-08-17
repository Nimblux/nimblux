import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const submissions = await prisma.opportunity.findMany({
      where: { createdById: user.id },
      orderBy: { createdAt: "desc" },
    });

    const counts = {
      total: submissions.length,
      approved: submissions.filter((s) => s.status === "APPROVED").length,
      pending: submissions.filter((s) => s.status === "PENDING").length,
      rejected: submissions.filter((s) => s.status === "REJECTED").length,
    };

    return NextResponse.json({ submissions, counts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
