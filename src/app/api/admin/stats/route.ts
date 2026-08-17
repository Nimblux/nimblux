import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();

    const [
      totalUsers,
      totalOpportunities,
      pendingOpportunities,
      approvedOpportunities,
      rejectedOpportunities,
      totalEvents,
      totalReports,
      clicksAggregate,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.opportunity.count(),
      prisma.opportunity.count({ where: { status: "PENDING" } }),
      prisma.opportunity.count({ where: { status: "APPROVED" } }),
      prisma.opportunity.count({ where: { status: "REJECTED" } }),
      prisma.event.count(),
      prisma.report.count({ where: { status: "PENDING" } }),
      prisma.opportunity.aggregate({ _sum: { clicksCount: true, viewsCount: true } }),
    ]);

    return NextResponse.json({
      stats: {
        totalUsers,
        totalOpportunities,
        pendingOpportunities,
        approvedOpportunities,
        rejectedOpportunities,
        totalEvents,
        pendingReports: totalReports,
        totalClicks: clicksAggregate._sum.clicksCount || 0,
        totalViews: clicksAggregate._sum.viewsCount || 0,
      },
    });
  } catch (error: any) {
    if (error.message === "FORBIDDEN_ADMIN_REQUIRED" || error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
