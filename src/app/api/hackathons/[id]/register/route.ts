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
      return NextResponse.json(
        { error: "Please log in to register for this hackathon." },
        { status: 401 }
      );
    }

    const hackathon = await prisma.hackathon.findFirst({
      where: { OR: [{ id: params.id }, { slug: params.id }] },
    });

    if (!hackathon) {
      return NextResponse.json({ error: "Hackathon not found." }, { status: 404 });
    }

    // Check if registration is open
    const now = new Date();
    if (!hackathon.isRegistrationOpen || hackathon.regEndDate < now) {
      return NextResponse.json(
        { error: "Registration for this hackathon is currently closed." },
        { status: 400 }
      );
    }

    // Check if user is already registered
    const existingRegistration = await prisma.hackathonRegistration.findUnique({
      where: {
        hackathonId_userId: {
          hackathonId: hackathon.id,
          userId: user.id,
        },
      },
    });

    if (existingRegistration) {
      return NextResponse.json(
        { error: "You are already registered for this hackathon!", registration: existingRegistration },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const {
      name = user.name,
      email = user.email,
      phone = user.phone,
      college = user.college,
      degree = user.degree,
      graduationYear = user.graduationYear,
      skills = user.skills,
      githubUrl = user.githubUrl,
      linkedinUrl = user.linkedinUrl,
      portfolioUrl = user.portfolioUrl,
    } = body;

    // Create registration
    const registration = await prisma.hackathonRegistration.create({
      data: {
        hackathonId: hackathon.id,
        userId: user.id,
        name: name?.trim() || user.name,
        email: email?.trim() || user.email,
        phone: phone?.trim() || null,
        college: college?.trim() || null,
        degree: degree?.trim() || null,
        graduationYear: graduationYear?.trim() || null,
        skills: skills?.trim() || null,
        githubUrl: githubUrl?.trim() || null,
        linkedinUrl: linkedinUrl?.trim() || null,
        portfolioUrl: portfolioUrl?.trim() || null,
        status: "APPROVED", // Auto-approved default
      },
    });

    // Optionally update user profile if new information was provided
    await prisma.user.update({
      where: { id: user.id },
      data: {
        phone: phone || user.phone,
        college: college || user.college,
        degree: degree || user.degree,
        graduationYear: graduationYear || user.graduationYear,
        skills: skills || user.skills,
        githubUrl: githubUrl || user.githubUrl,
        linkedinUrl: linkedinUrl || user.linkedinUrl,
        portfolioUrl: portfolioUrl || user.portfolioUrl,
      },
    });

    // Send confirmation notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: "Registration Confirmed! 🎉",
        message: `You have successfully registered for ${hackathon.title}. You can now create or join a team!`,
        type: "HACKATHON",
        link: `/hackathon/${hackathon.slug}`,
      },
    });

    return NextResponse.json({
      success: true,
      registration,
      message: "Successfully registered for the hackathon!",
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to complete registration." },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ isRegistered: false });
    }

    const hackathon = await prisma.hackathon.findFirst({
      where: { OR: [{ id: params.id }, { slug: params.id }] },
    });

    if (!hackathon) {
      return NextResponse.json({ error: "Hackathon not found." }, { status: 404 });
    }

    const registration = await prisma.hackathonRegistration.findUnique({
      where: {
        hackathonId_userId: {
          hackathonId: hackathon.id,
          userId: user.id,
        },
      },
      include: {
        team: {
          include: {
            members: {
              include: {
                user: {
                  select: { id: true, name: true, profileImage: true, college: true },
                },
              },
            },
            leader: { select: { id: true, name: true } },
          },
        },
      },
    });

    return NextResponse.json({
      isRegistered: Boolean(registration),
      registration,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to check registration." },
      { status: 500 }
    );
  }
}
