import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(req.url);
    const trackId = searchParams.get("trackId");
    const status = searchParams.get("status");

    const hackathon = await prisma.hackathon.findFirst({
      where: { OR: [{ id: params.id }, { slug: params.id }] },
    });

    if (!hackathon) {
      return NextResponse.json({ error: "Hackathon not found." }, { status: 404 });
    }

    const isOrganizer = user ? user.id === hackathon.createdById : false;
    const isAdmin = user ? user.role === "ADMIN" : false;

    // Check if user is a judge
    let isJudge = false;
    if (user) {
      const judgeRecord = await prisma.hackathonJudge.findUnique({
        where: { hackathonId_userId: { hackathonId: hackathon.id, userId: user.id } },
      });
      isJudge = Boolean(judgeRecord);
    }

    // If organizer, admin, or judge, they can view all submissions
    if (isOrganizer || isAdmin || isJudge) {
      const where: any = { hackathonId: hackathon.id };
      if (trackId && trackId !== "all") where.trackId = trackId;
      if (status && status !== "ALL") where.status = status;

      const submissions = await prisma.hackathonSubmission.findMany({
        where,
        include: {
          team: {
            include: {
              members: {
                include: {
                  user: { select: { id: true, name: true, email: true, profileImage: true, college: true } },
                },
              },
            },
          },
          user: { select: { id: true, name: true, email: true, profileImage: true, college: true } },
          track: true,
          scores: {
            include: {
              judge: { select: { id: true, name: true } },
              criterion: true,
            },
          },
          winners: true,
        },
        orderBy: [{ totalScore: "desc" }, { submittedAt: "desc" }],
      });

      return NextResponse.json({ submissions, count: submissions.length });
    }

    // Otherwise, return only current user's / team's submission
    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const registration = await prisma.hackathonRegistration.findUnique({
      where: { hackathonId_userId: { hackathonId: hackathon.id, userId: user.id } },
    });

    let submission = null;
    if (registration?.teamId) {
      submission = await prisma.hackathonSubmission.findFirst({
        where: { hackathonId: hackathon.id, teamId: registration.teamId },
        include: { track: true, team: true },
      });
    } else {
      submission = await prisma.hackathonSubmission.findFirst({
        where: { hackathonId: hackathon.id, userId: user.id },
        include: { track: true },
      });
    }

    return NextResponse.json({ submission });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch submissions." },
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
    if (!user) {
      return NextResponse.json({ error: "Please log in to submit a project." }, { status: 401 });
    }

    const hackathon = await prisma.hackathon.findFirst({
      where: { OR: [{ id: params.id }, { slug: params.id }] },
    });

    if (!hackathon) {
      return NextResponse.json({ error: "Hackathon not found." }, { status: 404 });
    }

    // Must be registered
    const registration = await prisma.hackathonRegistration.findUnique({
      where: { hackathonId_userId: { hackathonId: hackathon.id, userId: user.id } },
    });

    if (!registration) {
      return NextResponse.json(
        { error: "You must be registered for this hackathon to submit a project." },
        { status: 400 }
      );
    }

    // Check submission deadline
    const now = new Date();
    const isPastDeadline = hackathon.submissionDeadline < now;
    if (isPastDeadline && !hackathon.allowLateSubmissions && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Project submission deadline has passed for this hackathon." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const {
      title,
      tagline,
      description,
      problemStatement,
      solution,
      techStack,
      githubUrl,
      demoUrl,
      videoUrl,
      presentationUrl,
      screenshots,
      trackId,
      isDraft = false,
    } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: "Project title and description are required." },
        { status: 400 }
      );
    }

    const teamId = registration.teamId || null;
    const submissionStatus = isDraft ? "DRAFT" : "SUBMITTED";

    // Upsert submission for team or solo submitter
    let existingSubmission = null;
    if (teamId) {
      existingSubmission = await prisma.hackathonSubmission.findFirst({
        where: { hackathonId: hackathon.id, teamId },
      });
    } else {
      existingSubmission = await prisma.hackathonSubmission.findFirst({
        where: { hackathonId: hackathon.id, userId: user.id },
      });
    }

    let submission;
    if (existingSubmission) {
      submission = await prisma.hackathonSubmission.update({
        where: { id: existingSubmission.id },
        data: {
          title: title.trim(),
          tagline: tagline?.trim() || null,
          description: description.trim(),
          problemStatement: problemStatement?.trim() || null,
          solution: solution?.trim() || null,
          techStack: techStack?.trim() || null,
          githubUrl: githubUrl?.trim() || null,
          demoUrl: demoUrl?.trim() || null,
          videoUrl: videoUrl?.trim() || null,
          presentationUrl: presentationUrl?.trim() || null,
          screenshots: typeof screenshots === "string" ? screenshots : (screenshots ? JSON.stringify(screenshots) : null),
          trackId: trackId || null,
          status: submissionStatus,
          isLate: isPastDeadline,
          submittedAt: !isDraft ? new Date() : existingSubmission.submittedAt,
        },
      });
    } else {
      submission = await prisma.hackathonSubmission.create({
        data: {
          hackathonId: hackathon.id,
          teamId,
          userId: user.id,
          title: title.trim(),
          tagline: tagline?.trim() || null,
          description: description.trim(),
          problemStatement: problemStatement?.trim() || null,
          solution: solution?.trim() || null,
          techStack: techStack?.trim() || null,
          githubUrl: githubUrl?.trim() || null,
          demoUrl: demoUrl?.trim() || null,
          videoUrl: videoUrl?.trim() || null,
          presentationUrl: presentationUrl?.trim() || null,
          screenshots: typeof screenshots === "string" ? screenshots : (screenshots ? JSON.stringify(screenshots) : null),
          trackId: trackId || null,
          status: submissionStatus,
          isLate: isPastDeadline,
          submittedAt: !isDraft ? new Date() : null,
        },
      });
    }

    // Send confirmation notification
    if (!isDraft) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: "Project Submitted! 🚀",
          message: `Your project "${title}" has been successfully submitted for ${hackathon.title}. Good luck!`,
          type: "HACKATHON",
          link: `/hackathon/${hackathon.slug}`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      submission,
      message: isDraft
        ? "Project draft saved successfully."
        : "Project submitted successfully to the hackathon!",
    });
  } catch (error: any) {
    console.error("Submission error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit project." },
      { status: 500 }
    );
  }
}
