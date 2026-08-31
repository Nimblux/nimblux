import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import crypto from "crypto";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();

    const opportunity = await prisma.opportunity.findUnique({
      where: { id: params.id },
    });

    if (!opportunity) {
      return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
    }

    if (opportunity.createdById !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { userId, recipientName, role, prizeTitle, generateAllParticipants } = body;

    let createdCount = 0;

    if (generateAllParticipants) {
      // Fetch all registered attendees and selected applicants
      const [registrations, applications] = await Promise.all([
        prisma.opportunityRegistration.findMany({
          where: { opportunityId: params.id, status: { not: "CANCELLED" } },
          include: { user: true },
        }),
        prisma.opportunityApplication.findMany({
          where: { opportunityId: params.id, status: { in: ["SELECTED", "SHORTLISTED"] } },
          include: { user: true },
        }),
      ]);

      const participantsToCertify = new Map<string, { userId: string; name: string; role: string }>();

      registrations.forEach((r) => {
        participantsToCertify.set(r.userId, {
          userId: r.userId,
          name: r.name || r.user.name,
          role: "PARTICIPANT",
        });
      });

      applications.forEach((a) => {
        participantsToCertify.set(a.userId, {
          userId: a.userId,
          name: a.name || a.user.name,
          role: a.status === "SELECTED" ? "WINNER" : "PARTICIPANT",
        });
      });

      const participantsList = Array.from(participantsToCertify.entries());

      for (const [pUserId, pData] of participantsList) {
        // Check if certificate already exists
        const existing = await prisma.certificate.findFirst({
          where: {
            opportunityId: params.id,
            userId: pUserId,
          },
        });

        if (!existing) {
          const randomSuffix = crypto.randomBytes(4).toString("hex").toUpperCase();
          const certCode = `NMB-${opportunity.category.slice(0, 4).toUpperCase()}-${randomSuffix}`;

          await prisma.certificate.create({
            data: {
              certificateCode: certCode,
              opportunityId: params.id,
              userId: pUserId,
              recipientName: pData.name,
              opportunityTitle: opportunity.title,
              opportunityType: opportunity.opportunityType,
              organizationName: opportunity.organization,
              role: pData.role,
              issueDate: new Date(),
            },
          });

          // Notify participant
          await prisma.notification.create({
            data: {
              userId: pUserId,
              title: "Certificate Issued! 📜",
              message: `Your official verifiable certificate for "${opportunity.title}" is ready. View and download from your dashboard.`,
              type: "SYSTEM",
              link: `/certificate/${certCode}`,
            },
          });

          createdCount++;
        }
      }
    } else {
      // Single certificate generation
      if (!userId || !recipientName) {
        return NextResponse.json(
          { error: "User ID and recipient name are required for single certificate issuance." },
          { status: 400 }
        );
      }

      const randomSuffix = crypto.randomBytes(4).toString("hex").toUpperCase();
      const certCode = `NMB-${opportunity.category.slice(0, 4).toUpperCase()}-${randomSuffix}`;

      const cert = await prisma.certificate.create({
        data: {
          certificateCode: certCode,
          opportunityId: params.id,
          userId,
          recipientName: recipientName.trim(),
          opportunityTitle: opportunity.title,
          opportunityType: opportunity.opportunityType,
          organizationName: opportunity.organization,
          role: role || "PARTICIPANT",
          prizeTitle: prizeTitle?.trim() || null,
          issueDate: new Date(),
        },
      });

      await prisma.notification.create({
        data: {
          userId,
          title: "Certificate Issued! 📜",
          message: `Your official verifiable certificate for "${opportunity.title}" is ready.`,
          type: "SYSTEM",
          link: `/certificate/${certCode}`,
        },
      });

      return NextResponse.json({
        success: true,
        certificate: cert,
        message: "Certificate generated successfully.",
      });
    }

    return NextResponse.json({
      success: true,
      count: createdCount,
      message: `Generated ${createdCount} verifiable certificates.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to generate certificates" },
      { status: 500 }
    );
  }
}
