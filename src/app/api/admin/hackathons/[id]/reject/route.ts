import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const body = await req.json();
    const { reason = "Please refine hackathon information and schedule before resubmission." } = body;

    const hackathon = await prisma.hackathon.findUnique({
      where: { id: params.id },
    });

    if (!hackathon) {
      return NextResponse.json({ error: "Hackathon not found." }, { status: 404 });
    }

    const updated = await prisma.hackathon.update({
      where: { id: params.id },
      data: {
        status: "REJECTED",
        rejectionReason: reason,
      },
    });

    // Notify creator
    await prisma.notification.create({
      data: {
        userId: hackathon.createdById,
        title: "Hackathon Revision Requested ⚠️",
        message: `Your hackathon "${hackathon.title}" requires revisions. Feedback: ${reason}`,
        type: "REJECTION",
        link: `/organizer/hackathons/${hackathon.id}`,
      },
    });

    return NextResponse.json({
      success: true,
      hackathon: updated,
      message: "Hackathon marked for revision.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to reject hackathon." },
      { status: 500 }
    );
  }
}
