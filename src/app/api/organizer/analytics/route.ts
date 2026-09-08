import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isFullAdmin = user.role === "ADMIN";
    const oppWhere = isFullAdmin ? {} : { createdById: user.id };
    const hackWhere = isFullAdmin ? {} : { createdById: user.id };

    const [opportunities, applications, registrations, hackathons] = await Promise.all([
      prisma.opportunity.findMany({
        where: oppWhere,
        select: {
          id: true,
          title: true,
          viewsCount: true,
          clicksCount: true,
          opportunityType: true,
          status: true,
          createdAt: true,
        },
      }),
      prisma.opportunityApplication.findMany({
        where: { opportunity: oppWhere },
        select: {
          id: true,
          status: true,
          college: true,
          skills: true,
          rating: true,
          createdAt: true,
        },
      }),
      prisma.opportunityRegistration.findMany({
        where: { opportunity: oppWhere },
        select: {
          id: true,
          status: true,
          attendanceMarked: true,
          createdAt: true,
        },
      }),
      prisma.hackathon.findMany({
        where: hackWhere,
        select: {
          id: true,
          title: true,
          status: true,
          _count: {
            select: {
              registrations: true,
              teams: true,
              submissions: true,
            },
          },
        },
      }),
    ]);

    const totalViews = opportunities.reduce((acc, o) => acc + (o.viewsCount || 0), 0);
    const totalClicks = opportunities.reduce((acc, o) => acc + (o.clicksCount || 0), 0);
    const totalApplications = applications.length;
    const totalRegistrations = registrations.length;
    const totalHackathonRegistrations = hackathons.reduce((acc, h) => acc + (h._count?.registrations || 0), 0);

    const conversionRate = totalViews > 0 ? ((totalApplications / totalViews) * 100).toFixed(1) : "0.0";

    // Application Stage Distribution
    const stageCounts: Record<string, number> = {
      SUBMITTED: 0,
      UNDER_REVIEW: 0,
      SHORTLISTED: 0,
      INTERVIEW: 0,
      SELECTED: 0,
      REJECTED: 0,
    };
    for (const app of applications) {
      stageCounts[app.status] = (stageCounts[app.status] || 0) + 1;
    }

    // Top Candidate Colleges
    const collegeMap = new Map<string, number>();
    for (const app of applications) {
      if (app.college?.trim()) {
        const col = app.college.trim();
        collegeMap.set(col, (collegeMap.get(col) || 0) + 1);
      }
    }
    const topColleges = Array.from(collegeMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Top Candidate Skills
    const skillMap = new Map<string, number>();
    for (const app of applications) {
      if (app.skills) {
        const tags = app.skills.split(",").map((s) => s.trim()).filter(Boolean);
        for (const tag of tags) {
          skillMap.set(tag, (skillMap.get(tag) || 0) + 1);
        }
      }
    }
    const topSkills = Array.from(skillMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    return NextResponse.json({
      summary: {
        totalOpportunities: opportunities.length,
        totalHackathons: hackathons.length,
        totalViews,
        totalClicks,
        totalApplications,
        totalRegistrations,
        totalHackathonRegistrations,
        conversionRate,
      },
      stageCounts,
      topColleges,
      topSkills,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch analytics." },
      { status: 500 }
    );
  }
}
