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
      opportunities,
      totalParticipants,
      totalTeams,
      totalSubmissions,
      totalWinners,
      totalApplications,
      totalRegistrations,
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
      prisma.opportunity.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: {
              applications: true,
              registrations: true,
              announcements: true,
              certificates: true,
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
      prisma.opportunityApplication.count({
        where: isFullAdmin ? {} : { opportunity: { createdById: user.id } },
      }),
      prisma.opportunityRegistration.count({
        where: isFullAdmin ? {} : { opportunity: { createdById: user.id } },
      }),
    ]);

    const stats = {
      totalHackathons: hackathons.length,
      totalOpportunities: opportunities.length,
      publishedHackathons: hackathons.filter((h) => h.status === "PUBLISHED" || h.status === "APPROVED").length,
      publishedOpportunities: opportunities.filter((o) => o.status === "APPROVED").length,
      pendingOpportunities: opportunities.filter((o) => o.status === "PENDING").length,
      totalParticipants,
      totalTeams,
      totalSubmissions,
      totalWinners,
      totalApplications,
      totalRegistrations,
      totalViews: opportunities.reduce((acc, o) => acc + (o.viewsCount || 0), 0),
      totalClicks: opportunities.reduce((acc, o) => acc + (o.clicksCount || 0), 0),
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
      opportunities: opportunities.map((o) => ({
        ...o,
        applicationCount: o._count.applications,
        registrationCount: o._count.registrations,
        announcementCount: o._count.announcements,
        certificateCount: o._count.certificates,
      })),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch organizer stats." },
      { status: 500 }
    );
  }
}
