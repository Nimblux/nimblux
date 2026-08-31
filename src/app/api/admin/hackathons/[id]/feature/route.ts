import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const hackathon = await prisma.hackathon.findUnique({
      where: { id: params.id },
    });

    if (!hackathon) {
      return NextResponse.json({ error: "Hackathon not found." }, { status: 404 });
    }

    const updated = await prisma.hackathon.update({
      where: { id: params.id },
      data: {
        featured: !hackathon.featured,
      },
    });

    return NextResponse.json({
      success: true,
      featured: updated.featured,
      message: `Hackathon ${updated.featured ? "featured" : "unfeatured"} successfully.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to toggle featured status." },
      { status: 500 }
    );
  }
}
