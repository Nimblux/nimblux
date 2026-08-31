import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin();

    const hackathon = await prisma.hackathon.findUnique({
      where: { id: params.id },
      include: { createdBy: true },
    });

    if (!hackathon) {
      return NextResponse.json({ error: "Hackathon not found." }, { status: 404 });
    }

    const updated = await prisma.hackathon.update({
      where: { id: params.id },
      data: {
        status: "PUBLISHED",
        rejectionReason: null,
        approvedById: admin.id,
      },
    });

    // Notify creator
    await prisma.notification.create({
      data: {
        userId: hackathon.createdById,
        title: "Hackathon Approved & Published! 🚀",
        message: `Your hackathon "${hackathon.title}" has been reviewed, approved, and is now live on NIMBLUX!`,
        type: "APPROVAL",
        link: `/hackathon/${hackathon.slug}`,
      },
    });

    return NextResponse.json({
      success: true,
      hackathon: updated,
      message: "Hackathon approved and published successfully!",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to approve hackathon." },
      { status: 500 }
    );
  }
}
