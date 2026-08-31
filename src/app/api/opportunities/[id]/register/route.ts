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
      return NextResponse.json({ registration: null });
    }

    const registration = await prisma.opportunityRegistration.findUnique({
      where: {
        opportunityId_userId: {
          opportunityId: params.id,
          userId: user.id,
        },
      },
    });

    return NextResponse.json({ registration });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch registration status" },
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
        { error: "Authentication required to register." },
        { status: 401 }
      );
    }

    const opportunity = await prisma.opportunity.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            registrations: true,
          },
        },
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
        { error: "This opportunity is not currently accepting registrations." },
        { status: 400 }
      );
    }

    // Check capacity if specified
    if (opportunity.capacity && opportunity._count.registrations >= opportunity.capacity) {
      return NextResponse.json(
        { error: "This event/workshop has reached full capacity." },
        { status: 400 }
      );
    }

    // Check if already registered
    const existing = await prisma.opportunityRegistration.findUnique({
      where: {
        opportunityId_userId: {
          opportunityId: params.id,
          userId: user.id,
        },
      },
    });

    if (existing && existing.status !== "CANCELLED") {
      return NextResponse.json(
        { error: "You are already registered for this opportunity.", registration: existing },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { name, email, phone, college, answers } = body;

    const registrationName = name?.trim() || user.name;
    const registrationEmail = email?.trim() || user.email;

    const registration = await prisma.opportunityRegistration.upsert({
      where: {
        opportunityId_userId: {
          opportunityId: params.id,
          userId: user.id,
        },
      },
      update: {
        name: registrationName,
        email: registrationEmail,
        phone: phone?.trim() || user.phone || null,
        college: college?.trim() || user.college || null,
        answers: answers ? (typeof answers === "string" ? answers : JSON.stringify(answers)) : null,
        status: "REGISTERED",
      },
      create: {
        opportunityId: params.id,
        userId: user.id,
        name: registrationName,
        email: registrationEmail,
        phone: phone?.trim() || user.phone || null,
        college: college?.trim() || user.college || null,
        answers: answers ? (typeof answers === "string" ? answers : JSON.stringify(answers)) : null,
        status: "REGISTERED",
      },
    });

    // Notify user
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: `Registration Confirmed! 🎟️`,
        message: `You are officially registered for "${opportunity.title}". Check your dashboard for updates and schedule.`,
        type: "OPPORTUNITY",
        link: `/dashboard/registrations`,
      },
    });

    // Notify organizer if exists
    if (opportunity.createdById && opportunity.createdById !== user.id) {
      await prisma.notification.create({
        data: {
          userId: opportunity.createdById,
          title: `New Participant Registered 🎉`,
          message: `${registrationName} registered for "${opportunity.title}".`,
          type: "OPPORTUNITY",
          link: `/organizer/opportunities/${opportunity.id}`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      registration,
      message: "Registration confirmed successfully!",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to complete registration." },
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const registration = await prisma.opportunityRegistration.update({
      where: {
        opportunityId_userId: {
          opportunityId: params.id,
          userId: user.id,
        },
      },
      data: {
        status: "CANCELLED",
      },
    });

    return NextResponse.json({
      success: true,
      registration,
      message: "Registration cancelled successfully.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to cancel registration." },
      { status: 500 }
    );
  }
}
