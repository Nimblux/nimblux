import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.toLowerCase();

    const isFullAdmin = user.role === "ADMIN";
    const oppWhere = isFullAdmin ? {} : { createdById: user.id };
    const hackWhere = isFullAdmin ? {} : { createdById: user.id };

    const [applications, registrations, hackRegistrations] = await Promise.all([
      prisma.opportunityApplication.findMany({
        where: { opportunity: oppWhere },
        select: {
          id: true,
          userId: true,
          name: true,
          email: true,
          phone: true,
          college: true,
          degree: true,
          graduationYear: true,
          skills: true,
          resumeUrl: true,
          githubUrl: true,
          linkedinUrl: true,
          portfolioUrl: true,
          createdAt: true,
          opportunity: { select: { title: true, opportunityType: true } },
        },
      }),
      prisma.opportunityRegistration.findMany({
        where: { opportunity: oppWhere },
        select: {
          id: true,
          userId: true,
          name: true,
          email: true,
          phone: true,
          college: true,
          createdAt: true,
          opportunity: { select: { title: true, opportunityType: true } },
        },
      }),
      prisma.hackathonRegistration.findMany({
        where: { hackathon: hackWhere },
        select: {
          id: true,
          userId: true,
          name: true,
          email: true,
          phone: true,
          college: true,
          degree: true,
          graduationYear: true,
          skills: true,
          githubUrl: true,
          linkedinUrl: true,
          portfolioUrl: true,
          createdAt: true,
          hackathon: { select: { title: true } },
        },
      }),
    ]);

    // Aggregate unique participants by email
    const participantMap = new Map<string, any>();

    for (const app of applications) {
      const email = app.email.toLowerCase();
      if (!participantMap.has(email)) {
        participantMap.set(email, {
          userId: app.userId,
          name: app.name,
          email: app.email,
          phone: app.phone,
          college: app.college,
          degree: app.degree,
          graduationYear: app.graduationYear,
          skills: app.skills,
          resumeUrl: app.resumeUrl,
          githubUrl: app.githubUrl,
          linkedinUrl: app.linkedinUrl,
          portfolioUrl: app.portfolioUrl,
          lastActive: app.createdAt,
          activities: [],
        });
      }
      participantMap.get(email).activities.push({
        type: "APPLICATION",
        title: app.opportunity.title,
        category: app.opportunity.opportunityType,
        date: app.createdAt,
      });
    }

    for (const reg of registrations) {
      const email = reg.email.toLowerCase();
      if (!participantMap.has(email)) {
        participantMap.set(email, {
          userId: reg.userId,
          name: reg.name,
          email: reg.email,
          phone: reg.phone,
          college: reg.college,
          lastActive: reg.createdAt,
          activities: [],
        });
      }
      participantMap.get(email).activities.push({
        type: "EVENT_REGISTRATION",
        title: reg.opportunity.title,
        category: reg.opportunity.opportunityType,
        date: reg.createdAt,
      });
    }

    for (const hreg of hackRegistrations) {
      const email = hreg.email.toLowerCase();
      if (!participantMap.has(email)) {
        participantMap.set(email, {
          userId: hreg.userId,
          name: hreg.name,
          email: hreg.email,
          phone: hreg.phone,
          college: hreg.college,
          degree: hreg.degree,
          graduationYear: hreg.graduationYear,
          skills: hreg.skills,
          githubUrl: hreg.githubUrl,
          linkedinUrl: hreg.linkedinUrl,
          portfolioUrl: hreg.portfolioUrl,
          lastActive: hreg.createdAt,
          activities: [],
        });
      }
      participantMap.get(email).activities.push({
        type: "HACKATHON",
        title: hreg.hackathon.title,
        category: "HACKATHON",
        date: hreg.createdAt,
      });
    }

    let participants = Array.from(participantMap.values());

    if (query) {
      participants = participants.filter((p) =>
        p.name?.toLowerCase().includes(query) ||
        p.email?.toLowerCase().includes(query) ||
        p.college?.toLowerCase().includes(query) ||
        p.skills?.toLowerCase().includes(query)
      );
    }

    return NextResponse.json({ participants, count: participants.length });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch participants." },
      { status: 500 }
    );
  }
}
