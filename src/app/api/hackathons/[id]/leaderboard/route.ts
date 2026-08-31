import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();

    const hackathon = await prisma.hackathon.findFirst({
      where: { OR: [{ id: params.id }, { slug: params.id }] },
    });

    if (!hackathon) {
      return NextResponse.json({ error: "Hackathon not found." }, { status: 404 });
    }

    const isOrganizer = user ? user.id === hackathon.createdById : false;
    const isAdmin = user ? user.role === "ADMIN" : false;

    // If leaderboard is not published, only organizer or admin can view
    if (!hackathon.isLeaderboardPublished && !isOrganizer && !isAdmin) {
      return NextResponse.json({
        isPublished: false,
        message: "Leaderboard has not been published yet by the organizers.",
        standings: [],
      });
    }

    // Fetch ranked submissions
    const submissions = await prisma.hackathonSubmission.findMany({
      where: {
        hackathonId: hackathon.id,
        status: { in: ["SUBMITTED", "UNDER_REVIEW", "JUDGED", "WINNER"] },
      },
      include: {
        team: {
          include: {
            members: {
              include: { user: { select: { id: true, name: true, profileImage: true, college: true } } },
            },
          },
        },
        user: { select: { id: true, name: true, profileImage: true, college: true } },
        track: true,
        winners: true,
      },
      orderBy: { totalScore: "desc" },
    });

    const standings = submissions.map((sub, index) => ({
      rank: index + 1,
      id: sub.id,
      title: sub.title,
      tagline: sub.tagline,
      teamName: sub.team?.name || sub.user.name,
      teamLogo: sub.team?.logo || null,
      members: sub.team?.members?.map((m) => m.user) || [sub.user],
      trackName: sub.track?.name || "General Track",
      totalScore: sub.totalScore,
      githubUrl: sub.githubUrl,
      demoUrl: sub.demoUrl,
      status: sub.status,
      isWinner: sub.winners.length > 0,
      winnerTitle: sub.winners[0]?.title || null,
    }));

    return NextResponse.json({
      isPublished: hackathon.isLeaderboardPublished,
      standings,
      count: standings.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch leaderboard." },
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
      return NextResponse.json({ error: "Forbidden: Only organizers can publish the leaderboard." }, { status: 403 });
    }

    const body = await req.json();
    const isPublished = Boolean(body.isPublished);

    const updated = await prisma.hackathon.update({
      where: { id: hackathon.id },
      data: { isLeaderboardPublished: isPublished },
    });

    return NextResponse.json({
      success: true,
      isLeaderboardPublished: updated.isLeaderboardPublished,
      message: isPublished ? "Leaderboard is now live and visible to participants!" : "Leaderboard hidden.",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update leaderboard status." }, { status: 500 });
  }
}
