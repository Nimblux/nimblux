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
    const body = await req.json();
    const { reason } = body;

    const opportunity = await prisma.opportunity.findUnique({
      where: { id },
    });

    if (!opportunity) {
      return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
    }

    const rejectionReason =
      reason?.trim() || "Submission did not meet quality or verification standards.";

    const updated = await prisma.opportunity.update({
      where: { id },
      data: {
        status: "REJECTED",
        rejectionReason,
        approvedById: admin.id,
      },
    });

    // Send notification to submitting user with rejection reason
    await prisma.notification.create({
      data: {
        userId: opportunity.createdById,
        title: "Opportunity Needs Revision ⚠️",
        message: `Your opportunity "${opportunity.title}" was not approved. Feedback: "${rejectionReason}". You can update and resubmit it from your dashboard.`,
        type: "REJECTION",
        link: "/dashboard/submissions",
      },
    });

    return NextResponse.json({
      success: true,
      opportunity: updated,
      message: "Opportunity marked as rejected with reason.",
    });
  } catch (error: any) {
    if (error.message === "FORBIDDEN_ADMIN_REQUIRED" || error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
