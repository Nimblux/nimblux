import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { calculateTotalPrizePool } from "@/lib/hackathon";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const slugOrId = params.id;
    const currentUser = await getCurrentUser();

    // Find hackathon by slug or id
    const hackathon = await prisma.hackathon.findFirst({
      where: {
        OR: [{ slug: slugOrId }, { id: slugOrId }],
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true, profileImage: true, college: true },
        },
        tracks: {
          orderBy: { createdAt: "asc" },
        },
        prizes: {
          orderBy: { displayOrder: "asc" },
        },
        criteria: {
          orderBy: { createdAt: "asc" },
        },
        sponsors: {
          orderBy: { createdAt: "asc" },
        },
        announcements: {
          orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
        },
        winners: {
          include: {
            prize: true,
            team: {
              include: {
                members: {
                  include: {
                    user: {
                      select: { id: true, name: true, profileImage: true, college: true },
                    },
                  },
                },
              },
            },
            submission: {
              select: { id: true, title: true, tagline: true, githubUrl: true, demoUrl: true, totalScore: true },
            },
          },
          orderBy: { rank: "asc" },
        },
        _count: {
          select: {
            registrations: true,
            teams: true,
            submissions: true,
            judges: true,
          },
        },
      },
    });

    if (!hackathon) {
      return NextResponse.json({ error: "Hackathon not found." }, { status: 404 });
    }

    // Check user registration & team details
    let userRegistration = null;
    let userTeam = null;
    let userSubmission = null;
    let isJudge = false;
    const isOrganizer = currentUser ? currentUser.id === hackathon.createdById : false;
    const isAdmin = currentUser ? currentUser.role === "ADMIN" : false;

    if (currentUser) {
      userRegistration = await prisma.hackathonRegistration.findUnique({
        where: {
          hackathonId_userId: {
            hackathonId: hackathon.id,
            userId: currentUser.id,
          },
        },
        include: {
          team: {
            include: {
              members: {
                include: {
                  user: {
                    select: { id: true, name: true, email: true, profileImage: true, college: true, skills: true },
                  },
                },
              },
              leader: {
                select: { id: true, name: true, email: true },
              },
              submission: true,
            },
          },
        },
      });

      if (userRegistration?.team) {
        userTeam = userRegistration.team;
        userSubmission = userRegistration.team.submission;
      } else {
        // Check for solo submission
        userSubmission = await prisma.hackathonSubmission.findFirst({
          where: {
            hackathonId: hackathon.id,
            userId: currentUser.id,
          },
        });
      }

      // Check if user is a judge for this hackathon
      const judgeRecord = await prisma.hackathonJudge.findUnique({
        where: {
          hackathonId_userId: {
            hackathonId: hackathon.id,
            userId: currentUser.id,
          },
        },
      });
      isJudge = Boolean(judgeRecord);
    }

    return NextResponse.json({
      hackathon: {
        ...hackathon,
        registrationCount: hackathon._count.registrations,
        teamCount: hackathon._count.teams,
        submissionCount: hackathon._count.submissions,
        judgeCount: hackathon._count.judges,
      },
      userState: {
        isRegistered: Boolean(userRegistration),
        registration: userRegistration,
        team: userTeam,
        submission: userSubmission,
        isOrganizer,
        isAdmin,
        isJudge,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch hackathon details." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const hackathon = await prisma.hackathon.findFirst({
      where: { OR: [{ id: params.id }, { slug: params.id }] },
    });

    if (!hackathon) {
      return NextResponse.json({ error: "Hackathon not found." }, { status: 404 });
    }

    // Permission check
    if (hackathon.createdById !== user.id && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: You do not have permission to edit this hackathon." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const updateData: any = {};

    const allowedFields = [
      "title", "tagline", "shortDescription", "description", "coverImage", "logo", "banner",
      "organizerName", "organizerLogo", "organizerDescription", "contactEmail", "contactPhone",
      "websiteUrl", "discordUrl", "mode", "location", "eligibility", "collegeRestrictions",
      "countryRestrictions", "experienceLevel", "allowIndividual", "allowTeam", "minTeamSize",
      "maxTeamSize", "isExternalRegistration", "externalRegistrationUrl", "isRegistrationOpen",
      "registrationFee", "isPaid", "rules", "submissionRequirements", "codeOfConduct",
      "techAllowed", "techProhibited", "hasPrizePool", "totalPrizePool", "prizeCurrency",
      "status", "rejectionReason", "featured", "verified", "isLeaderboardPublished", "allowLateSubmissions",
    ];

    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    });

    // Handle date fields
    if (body.regStartDate) updateData.regStartDate = new Date(body.regStartDate);
    if (body.regEndDate) updateData.regEndDate = new Date(body.regEndDate);
    if (body.startDate) updateData.startDate = new Date(body.startDate);
    if (body.endDate) updateData.endDate = new Date(body.endDate);
    if (body.submissionDeadline) updateData.submissionDeadline = new Date(body.submissionDeadline);
    if (body.judgingStartDate) updateData.judgingStartDate = new Date(body.judgingStartDate);
    if (body.judgingEndDate) updateData.judgingEndDate = new Date(body.judgingEndDate);
    if (body.winnersAnnouncedDate) updateData.winnersAnnouncedDate = new Date(body.winnersAnnouncedDate);

    // If prizes array provided, recalculate total prize pool
    if (body.prizes && Array.isArray(body.prizes)) {
      const computedTotal = calculateTotalPrizePool(body.prizes);
      if (computedTotal > 0) {
        updateData.totalPrizePool = String(computedTotal);
      }
    }

    const updated = await prisma.hackathon.update({
      where: { id: hackathon.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      hackathon: updated,
      message: "Hackathon updated successfully.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update hackathon." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const hackathon = await prisma.hackathon.findFirst({
      where: { OR: [{ id: params.id }, { slug: params.id }] },
    });

    if (!hackathon) {
      return NextResponse.json({ error: "Hackathon not found." }, { status: 404 });
    }

    if (hackathon.createdById !== user.id && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: You do not have permission to delete this hackathon." },
        { status: 403 }
      );
    }

    await prisma.hackathon.delete({
      where: { id: hackathon.id },
    });

    return NextResponse.json({ success: true, message: "Hackathon deleted successfully." });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete hackathon." },
      { status: 500 }
    );
  }
}
