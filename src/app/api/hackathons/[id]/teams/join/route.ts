import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Please log in to join a team." }, { status: 401 });
    }

    const hackathon = await prisma.hackathon.findFirst({
      where: { OR: [{ id: params.id }, { slug: params.id }] },
    });

    if (!hackathon) {
      return NextResponse.json({ error: "Hackathon not found." }, { status: 404 });
    }

    // Must be registered
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
        { error: "You must register for the hackathon first before joining a team." },
        { status: 400 }
      );
    }

    if (registration.teamId) {
      return NextResponse.json(
        { error: "You are already a member of a team for this hackathon. Leave your current team first." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { code } = body;

    if (!code || !code.trim()) {
      return NextResponse.json({ error: "Team invite code is required." }, { status: 400 });
    }

    const team = await prisma.hackathonTeam.findFirst({
      where: {
        hackathonId: hackathon.id,
        code: code.trim().toUpperCase(),
      },
      include: {
        members: true,
        leader: true,
      },
    });

    if (!team) {
      return NextResponse.json(
        { error: "Invalid team code. No matching team found in this hackathon." },
        { status: 404 }
      );
    }

    // Check maximum team size
    if (team.members.length >= hackathon.maxTeamSize) {
      return NextResponse.json(
        { error: `This team has reached the maximum capacity of ${hackathon.maxTeamSize} members.` },
        { status: 400 }
      );
    }

    // Add user to team
    await prisma.hackathonTeamMember.create({
      data: {
        teamId: team.id,
        userId: user.id,
        role: "MEMBER",
      },
    });

    // Update registration record
    await prisma.hackathonRegistration.update({
      where: { id: registration.id },
      data: { teamId: team.id },
    });

    // Notify team leader
    if (team.leaderId !== user.id) {
      await prisma.notification.create({
        data: {
          userId: team.leaderId,
          title: "New Team Member Joined! 🚀",
          message: `${user.name} has joined your team "${team.name}" for ${hackathon.title}.`,
          type: "HACKATHON",
          link: `/hackathon/${hackathon.slug}`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      team,
      message: `You have successfully joined team "${team.name}"!`,
    });
  } catch (error: any) {
    console.error("Join team error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to join team." },
      { status: 500 }
    );
  }
}
