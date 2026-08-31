import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const hackathon = await prisma.hackathon.findFirst({
      where: { OR: [{ id: params.id }, { slug: params.id }] },
    });

    if (!hackathon) {
      return NextResponse.json({ error: "Hackathon not found." }, { status: 404 });
    }

    const winners = await prisma.hackathonWinner.findMany({
      where: { hackathonId: hackathon.id },
      include: {
        prize: true,
        submission: {
          include: {
            user: { select: { id: true, name: true, profileImage: true, college: true } },
            track: true,
          },
        },
        team: {
          include: {
            members: {
              include: {
                user: { select: { id: true, name: true, profileImage: true, college: true, skills: true } },
              },
            },
          },
        },
      },
      orderBy: { rank: "asc" },
    });

    return NextResponse.json({ winners, count: winners.length });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch winners." },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const hackathon = await prisma.hackathon.findFirst({
      where: { OR: [{ id: params.id }, { slug: params.id }] },
    });

    if (!hackathon) return NextResponse.json({ error: "Hackathon not found." }, { status: 404 });

    if (hackathon.createdById !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Only the hackathon organizer can manage winners." }, { status: 403 });
    }

    const body = await req.json();
    const { winners } = body;
    // winners: Array of { prizeId?: string, submissionId: string, teamId?: string, rank: number, title: string, prizeAmount?: string, currency?: string }

    if (!Array.isArray(winners)) {
      return NextResponse.json({ error: "Winners array is required." }, { status: 400 });
    }

    // Reset previous winners if re-assigning
    await prisma.hackathonWinner.deleteMany({
      where: { hackathonId: hackathon.id },
    });

    // Create winner records
    for (const w of winners) {
      if (w.submissionId && w.title) {
        await prisma.hackathonWinner.create({
          data: {
            hackathonId: hackathon.id,
            prizeId: w.prizeId || null,
            submissionId: w.submissionId,
            teamId: w.teamId || null,
            rank: parseInt(w.rank) || 1,
            title: w.title.trim(),
            prizeAmount: w.prizeAmount ? String(w.prizeAmount) : null,
            currency: w.currency || hackathon.prizeCurrency || "INR",
          },
        });

        // Update submission status to WINNER
        await prisma.hackathonSubmission.update({
          where: { id: w.submissionId },
          data: { status: "WINNER" },
        });
      }
    }

    // Mark hackathon as COMPLETED
    await prisma.hackathon.update({
      where: { id: hackathon.id },
      data: {
        status: "COMPLETED",
        isLeaderboardPublished: true,
        winnersAnnouncedDate: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Winners announced successfully!",
    });
  } catch (error: any) {
    console.error("Winner selection error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to publish winners." },
      { status: 500 }
    );
  }
}
