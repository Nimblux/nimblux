import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; teamId: string } }
) {
  try {
    const team = await prisma.hackathonTeam.findUnique({
      where: { id: params.teamId },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, profileImage: true, college: true, skills: true, githubUrl: true, linkedinUrl: true },
            },
          },
        },
        leader: { select: { id: true, name: true, email: true } },
        submission: true,
      },
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found." }, { status: 404 });
    }

    return NextResponse.json({ team });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch team." }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; teamId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const team = await prisma.hackathonTeam.findUnique({
      where: { id: params.teamId },
    });

    if (!team) return NextResponse.json({ error: "Team not found." }, { status: 404 });
    if (team.leaderId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Only the team leader can edit team details." }, { status: 403 });
    }

    const body = await req.json();
    const { name, logo, description, newLeaderId } = body;

    const updateData: any = {};
    if (name) updateData.name = name.trim();
    if (logo !== undefined) updateData.logo = logo ? logo.trim() : null;
    if (description !== undefined) updateData.description = description ? description.trim() : null;

    if (newLeaderId && newLeaderId !== team.leaderId) {
      // Transfer leadership to an existing team member
      const member = await prisma.hackathonTeamMember.findUnique({
        where: { teamId_userId: { teamId: team.id, userId: newLeaderId } },
      });
      if (!member) {
        return NextResponse.json({ error: "New leader must be an existing team member." }, { status: 400 });
      }
      updateData.leaderId = newLeaderId;
      await prisma.hackathonTeamMember.update({
        where: { teamId_userId: { teamId: team.id, userId: team.leaderId } },
        data: { role: "MEMBER" },
      });
      await prisma.hackathonTeamMember.update({
        where: { teamId_userId: { teamId: team.id, userId: newLeaderId } },
        data: { role: "LEADER" },
      });
    }

    const updated = await prisma.hackathonTeam.update({
      where: { id: team.id },
      data: updateData,
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, profileImage: true, college: true } },
          },
        },
        leader: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ success: true, team: updated, message: "Team updated successfully." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update team." }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; teamId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get("userId") || user.id;

    const team = await prisma.hackathonTeam.findUnique({
      where: { id: params.teamId },
      include: { members: true },
    });

    if (!team) return NextResponse.json({ error: "Team not found." }, { status: 404 });

    // If removing another user, requester must be leader or admin
    if (targetUserId !== user.id && team.leaderId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Only the team leader can remove members." }, { status: 403 });
    }

    // If team leader is leaving and there are other members, they must transfer leadership first
    if (targetUserId === team.leaderId && team.members.length > 1) {
      return NextResponse.json(
        { error: "Team leader cannot leave without transferring leadership to another member or deleting the team." },
        { status: 400 }
      );
    }

    // Remove member
    await prisma.hackathonTeamMember.deleteMany({
      where: { teamId: team.id, userId: targetUserId },
    });

    // Update user registration to clear teamId
    await prisma.hackathonRegistration.updateMany({
      where: { hackathonId: team.hackathonId, userId: targetUserId },
      data: { teamId: null },
    });

    // If last member left or leader deleted the team
    if (team.members.length <= 1 || (targetUserId === team.leaderId && team.members.length === 1)) {
      await prisma.hackathonTeam.delete({ where: { id: team.id } });
      return NextResponse.json({ success: true, message: "Team has been disbanded." });
    }

    return NextResponse.json({ success: true, message: "Member removed from team." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to perform team action." }, { status: 500 });
  }
}
