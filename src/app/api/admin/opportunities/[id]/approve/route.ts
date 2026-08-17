import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin();
    const { id } = params;

    const opportunity = await prisma.opportunity.findUnique({
      where: { id },
    });

    if (!opportunity) {
      return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
    }

    const updated = await prisma.opportunity.update({
      where: { id },
      data: {
        status: "APPROVED",
        approvedById: admin.id,
        rejectionReason: null,
      },
    });

    // Send notification to submitting user
    await prisma.notification.create({
      data: {
        userId: opportunity.createdById,
        title: "Opportunity Approved! 🚀",
        message: `Great news! Your opportunity "${opportunity.title}" has been approved and published on NIMBLUX.`,
        type: "APPROVAL",
        link: `/opportunity/${opportunity.slug}`,
      },
    });

    return NextResponse.json({
      success: true,
      opportunity: updated,
      message: "Opportunity approved and published successfully.",
    });
  } catch (error: any) {
    if (error.message === "FORBIDDEN_ADMIN_REQUIRED" || error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
