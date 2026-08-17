import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const { opportunityId, reason, details } = await req.json();

    if (!opportunityId || !reason) {
      return NextResponse.json({ error: "Missing opportunityId or reason" }, { status: 400 });
    }

    const report = await prisma.report.create({
      data: {
        opportunityId,
        reason,
        details: details || null,
        userId: user ? user.id : null,
      },
    });

    return NextResponse.json({ success: true, report });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
