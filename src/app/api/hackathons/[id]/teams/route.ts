import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { generateTeamCode } from "@/lib/hackathon";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Please log in to create a team." }, { status: 401 });
    }

    const hackathon = await prisma.hackathon.findFirst({
      where: { OR: [{ id: params.id }, { slug: params.id }] },
    });

    if (!hackathon) {
      return NextResponse.json({ error: "Hackathon not found." }, { status: 404 });
    }

    if (!hackathon.allowTeam) {
      return NextResponse.json({ error: "Teams are not allowed for this hackathon (Individual only)." }, { status: 400 });
    }

    // Must be registered for the hackathon
    const registration = await prisma.hackathonRegistration.findUnique({
      where: {
        hackathonId_userId: {
          hackathonId: hackathon.id,
          userId: user.id,
        },
      },
    });

    if (!registration) {
      return NextResponse.json(
        { error: "You must register for the hackathon before creating a team." },
        { status: 400 }
      );
    }

    // Check if user is already in a team for this hackathon
    if (registration.teamId) {
      return NextResponse.json(
        { error: "You are already a member of a team in this hackathon. Leave your current team first." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { name, logo, description } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Team name is required." }, { status: 400 });
    }

    // Generate unique team join code
    let code = generateTeamCode(name);
    let attempts = 0;
    while (await prisma.hackathonTeam.findUnique({ where: { code } })) {
      code = generateTeamCode(name);
      attempts++;
      if (attempts > 10) code = `TM-${Date.now().toString(36).toUpperCase()}`;
    }

    // Create team and assign leader
    const team = await prisma.hackathonTeam.create({
      data: {
        hackathonId: hackathon.id,
        name: name.trim(),
        code,
        logo: logo?.trim() || null,
        description: description?.trim() || null,
        leaderId: user.id,
        members: {
          create: {
            userId: user.id,
            role: "LEADER",
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, profileImage: true, college: true, skills: true },
            },
          },
        },
        leader: { select: { id: true, name: true } },
      },
    });

    // Update user registration with teamId
    await prisma.hackathonRegistration.update({
      where: { id: registration.id },
      data: { teamId: team.id },
    });

    return NextResponse.json({
      success: true,
      team,
      message: `Team "${team.name}" created successfully! Invite teammates using code ${team.code}`,
    });
  } catch (error: any) {
    console.error("Team creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create team." },
      { status: 500 }
    );
  }
}

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

    const teams = await prisma.hackathonTeam.findMany({
      where: { hackathonId: hackathon.id },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, profileImage: true, college: true, skills: true },
            },
          },
        },
        leader: { select: { id: true, name: true } },
        submission: {
          select: { id: true, title: true, status: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ teams, count: teams.length });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch teams." },
      { status: 500 }
    );
  }
}
