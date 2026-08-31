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
      return NextResponse.json({ application: null });
    }

    const application = await prisma.opportunityApplication.findUnique({
      where: {
        opportunityId_userId: {
          opportunityId: params.id,
          userId: user.id,
        },
      },
    });

    return NextResponse.json({ application });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch application" },
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
      return NextResponse.json(
        { error: "Authentication required to apply." },
        { status: 401 }
      );
    }

    const opportunity = await prisma.opportunity.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        title: true,
        organization: true,
        slug: true,
        deadline: true,
        createdById: true,
        status: true,
      },
    });

    if (!opportunity) {
      return NextResponse.json(
        { error: "Opportunity not found." },
        { status: 404 }
      );
    }

    if (opportunity.status !== "APPROVED") {
      return NextResponse.json(
        { error: "This opportunity is not currently open for applications." },
        { status: 400 }
      );
    }

    if (new Date() > new Date(opportunity.deadline)) {
      return NextResponse.json(
        { error: "The deadline for this opportunity has passed." },
        { status: 400 }
      );
    }

    // Check if already applied
    const existing = await prisma.opportunityApplication.findUnique({
      where: {
        opportunityId_userId: {
          opportunityId: params.id,
          userId: user.id,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "You have already submitted an application for this opportunity.", application: existing },
        { status: 400 }
      );
    }

    const body = await req.json();
    const {
      name,
      email,
      phone,
      college,
      degree,
      graduationYear,
      resumeUrl,
      portfolioUrl,
      githubUrl,
      linkedinUrl,
      skills,
      coverLetter,
      answers,
    } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required for application." },
        { status: 400 }
      );
    }

    const application = await prisma.opportunityApplication.create({
      data: {
        opportunityId: params.id,
        userId: user.id,
        name: name.trim(),
        email: email.trim(),
        phone: phone?.trim() || user.phone || null,
        college: college?.trim() || user.college || null,
        degree: degree?.trim() || user.degree || null,
        graduationYear: graduationYear?.trim() || user.graduationYear || null,
        resumeUrl: resumeUrl?.trim() || null,
        portfolioUrl: portfolioUrl?.trim() || user.portfolioUrl || null,
        githubUrl: githubUrl?.trim() || user.githubUrl || null,
        linkedinUrl: linkedinUrl?.trim() || user.linkedinUrl || null,
        skills: skills?.trim() || user.skills || null,
        coverLetter: coverLetter?.trim() || null,
        answers: answers ? (typeof answers === "string" ? answers : JSON.stringify(answers)) : null,
        status: "SUBMITTED",
      },
    });

    // Notify candidate
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: `Application Submitted 🚀`,
        message: `Your application for "${opportunity.title}" at ${opportunity.organization} was successfully submitted. Track your status in your dashboard.`,
        type: "OPPORTUNITY",
        link: `/dashboard/applications`,
      },
    });

    // Notify organizer if exists
    if (opportunity.createdById && opportunity.createdById !== user.id) {
      await prisma.notification.create({
        data: {
          userId: opportunity.createdById,
          title: `New Candidate Applied 👤`,
          message: `${name} has applied for "${opportunity.title}". Review their submission in your organizer console.`,
          type: "OPPORTUNITY",
          link: `/organizer/opportunities/${opportunity.id}`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      application,
      message: "Application submitted successfully!",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to submit application." },
      { status: 500 }
    );
  }
}
