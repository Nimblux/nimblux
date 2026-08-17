import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    const { id } = params;

    const opp = await prisma.opportunity.findUnique({ where: { id } });
    if (!opp) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updated = await prisma.opportunity.update({
      where: { id },
      data: { featured: !opp.featured },
    });

    return NextResponse.json({ success: true, featured: updated.featured });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
