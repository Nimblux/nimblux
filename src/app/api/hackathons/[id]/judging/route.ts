import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Please log in." }, { status: 401 });
    }

    const hackathon = await prisma.hackathon.findFirst({
      where: { OR: [{ id: params.id }, { slug: params.id }] },
      include: {
        criteria: { orderBy: { createdAt: "asc" } },
        tracks: true,
      },
    });

    if (!hackathon) {
      return NextResponse.json({ error: "Hackathon not found." }, { status: 404 });
    }

    const isOrganizer = user.id === hackathon.createdById;
    const isAdmin = user.role === "ADMIN";

    // Check if judge
    const judgeRecord = await prisma.hackathonJudge.findUnique({
      where: { hackathonId_userId: { hackathonId: hackathon.id, userId: user.id } },
    });

    if (!isOrganizer && !isAdmin && !judgeRecord) {
      return NextResponse.json(
        { error: "Forbidden: You are not assigned as a judge or organizer for this hackathon." },
        { status: 403 }
      );
    }

    // Fetch submissions to judge
    const submissions = await prisma.hackathonSubmission.findMany({
      where: {
        hackathonId: hackathon.id,
        status: { in: ["SUBMITTED", "UNDER_REVIEW", "JUDGED", "WINNER"] },
      },
      include: {
        team: {
          include: {
            members: {
              include: { user: { select: { id: true, name: true, profileImage: true, college: true } } },
            },
          },
        },
        user: { select: { id: true, name: true, profileImage: true, college: true } },
        track: true,
        scores: {
          where: isOrganizer || isAdmin ? undefined : { judgeId: user.id },
          include: { criterion: true },
        },
      },
      orderBy: { submittedAt: "asc" },
    });

    return NextResponse.json({
      hackathon: {
        id: hackathon.id,
        title: hackathon.title,
        slug: hackathon.slug,
        criteria: hackathon.criteria,
        tracks: hackathon.tracks,
      },
      submissions,
      isOrganizer,
      isAdmin,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to load judging data." },
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
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const hackathon = await prisma.hackathon.findFirst({
      where: { OR: [{ id: params.id }, { slug: params.id }] },
      include: { criteria: true },
    });

    if (!hackathon) {
      return NextResponse.json({ error: "Hackathon not found." }, { status: 404 });
    }

    const isOrganizer = user.id === hackathon.createdById;
    const isAdmin = user.role === "ADMIN";
    const judgeRecord = await prisma.hackathonJudge.findUnique({
      where: { hackathonId_userId: { hackathonId: hackathon.id, userId: user.id } },
    });

    if (!isOrganizer && !isAdmin && !judgeRecord) {
      return NextResponse.json({ error: "Forbidden: You are not authorized to score submissions." }, { status: 403 });
    }

    const body = await req.json();
    const { submissionId, scores, feedback, isFinal = false } = body;
    // scores: Array of { criterionId: string, score: number }

    if (!submissionId || !Array.isArray(scores)) {
      return NextResponse.json({ error: "Submission ID and scores array are required." }, { status: 400 });
    }

    const submission = await prisma.hackathonSubmission.findUnique({
      where: { id: submissionId },
    });

    if (!submission || submission.hackathonId !== hackathon.id) {
      return NextResponse.json({ error: "Submission not found in this hackathon." }, { status: 404 });
    }

    // Save individual criteria scores
    for (const item of scores) {
      if (item.criterionId && item.score !== undefined) {
        await prisma.hackathonScore.upsert({
          where: {
            submissionId_judgeId_criterionId: {
              submissionId,
              judgeId: user.id,
              criterionId: item.criterionId,
            },
          },
          update: {
            score: parseFloat(item.score),
            feedback: feedback || null,
            isFinal: Boolean(isFinal),
          },
          create: {
            submissionId,
            judgeId: user.id,
            criterionId: item.criterionId,
            score: parseFloat(item.score),
            feedback: feedback || null,
            isFinal: Boolean(isFinal),
          },
        });
      }
    }

    // Recompute total weighted score for the submission across all scores
    const allScores = await prisma.hackathonScore.findMany({
      where: { submissionId },
      include: { criterion: true },
    });

    let totalWeightedScore = 0;
    let totalWeight = 0;

    allScores.forEach((s) => {
      const weight = s.criterion.weight || 1.0;
      totalWeightedScore += s.score * weight;
      totalWeight += weight;
    });

    const averageNormalizedScore = totalWeight > 0 ? (totalWeightedScore / totalWeight) * 10 : 0;
    const roundedScore = Math.round(averageNormalizedScore * 10) / 10;

    await prisma.hackathonSubmission.update({
      where: { id: submissionId },
      data: {
        totalScore: roundedScore,
        status: isFinal ? "JUDGED" : "UNDER_REVIEW",
      },
    });

    return NextResponse.json({
      success: true,
      totalScore: roundedScore,
      message: isFinal ? "Scores submitted and finalized!" : "Scores saved as draft.",
    });
  } catch (error: any) {
    console.error("Judging score submission error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit scores." },
      { status: 500 }
    );
  }
}
