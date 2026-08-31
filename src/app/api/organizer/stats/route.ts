import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const isFullAdmin = user.role === "ADMIN";
    const whereClause = isFullAdmin ? {} : { createdById: user.id };

    const [
      hackathons,
      totalParticipants,
      totalTeams,
      totalSubmissions,
      totalWinners,
    ] = await Promise.all([
      prisma.hackathon.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: {
              registrations: true,
              teams: true,
              submissions: true,
              winners: true,
            },
          },
        },
      }),
      prisma.hackathonRegistration.count({
        where: isFullAdmin ? {} : { hackathon: { createdById: user.id } },
      }),
      prisma.hackathonTeam.count({
        where: isFullAdmin ? {} : { hackathon: { createdById: user.id } },
      }),
      prisma.hackathonSubmission.count({
        where: isFullAdmin ? {} : { hackathon: { createdById: user.id } },
      }),
      prisma.hackathonWinner.count({
        where: isFullAdmin ? {} : { hackathon: { createdById: user.id } },
      }),
    ]);

    const stats = {
      totalHackathons: hackathons.length,
      published: hackathons.filter((h) => h.status === "PUBLISHED" || h.status === "APPROVED").length,
      drafts: hackathons.filter((h) => h.status === "DRAFT").length,
      pending: hackathons.filter((h) => h.status === "PENDING").length,
      totalParticipants,
      totalTeams,
      totalSubmissions,
      totalWinners,
    };

    return NextResponse.json({
      stats,
      hackathons: hackathons.map((h) => ({
        ...h,
        registrationCount: h._count.registrations,
        teamCount: h._count.teams,
        submissionCount: h._count.submissions,
        winnerCount: h._count.winners,
      })),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch organizer stats." },
      { status: 500 }
    );
  }
}
