import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { generateCertificateCode } from "@/lib/hackathon";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    const hackathon = await prisma.hackathon.findFirst({
      where: { OR: [{ id: params.id }, { slug: params.id }] },
    });

    if (!hackathon) {
      return NextResponse.json({ error: "Hackathon not found." }, { status: 404 });
    }

    const isOrganizer = user ? user.id === hackathon.createdById : false;
    const isAdmin = user ? user.role === "ADMIN" : false;

    // If participant, return only their certificates
    const where: any = { hackathonId: hackathon.id };
    if (!isOrganizer && !isAdmin) {
      if (!user) return NextResponse.json({ certificates: [] });
      where.userId = user.id;
    }

    const certificates = await prisma.hackathonCertificate.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ certificates, count: certificates.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch certificates." }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const hackathon = await prisma.hackathon.findFirst({
      where: { OR: [{ id: params.id }, { slug: params.id }] },
      include: {
        registrations: { include: { user: true } },
        winners: {
          include: {
            submission: {
              include: {
                user: true,
                team: { include: { members: { include: { user: true } } } },
              },
            },
          },
        },
      },
    });

    if (!hackathon) return NextResponse.json({ error: "Hackathon not found." }, { status: 404 });

    if (hackathon.createdById !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Only the hackathon organizer can issue certificates." }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { targetRole = "ALL" } = body; // "PARTICIPANT" | "WINNER" | "ALL"

    let generatedCount = 0;

    // 1. Issue Winner Certificates
    if (targetRole === "WINNER" || targetRole === "ALL") {
      for (const winner of hackathon.winners) {
        const recipients = winner.submission.team
          ? winner.submission.team.members.map((m) => m.user)
          : [winner.submission.user];

        for (const recipient of recipients) {
          const existing = await prisma.hackathonCertificate.findFirst({
            where: {
              hackathonId: hackathon.id,
              userId: recipient.id,
              role: "WINNER",
            },
          });

          if (!existing) {
            let code = generateCertificateCode();
            while (await prisma.hackathonCertificate.findUnique({ where: { certificateCode: code } })) {
              code = generateCertificateCode();
            }

            await prisma.hackathonCertificate.create({
              data: {
                certificateCode: code,
                hackathonId: hackathon.id,
                userId: recipient.id,
                recipientName: recipient.name,
                role: "WINNER",
                prizeTitle: winner.title,
                issueDate: new Date(),
              },
            });
            generatedCount++;
          }
        }
      }
    }

    // 2. Issue Participation Certificates to all registered users
    if (targetRole === "PARTICIPANT" || targetRole === "ALL") {
      for (const reg of hackathon.registrations) {
        const existing = await prisma.hackathonCertificate.findFirst({
          where: {
            hackathonId: hackathon.id,
            userId: reg.userId,
            role: "PARTICIPANT",
          },
        });

        if (!existing) {
          let code = generateCertificateCode();
          while (await prisma.hackathonCertificate.findUnique({ where: { certificateCode: code } })) {
            code = generateCertificateCode();
          }

          await prisma.hackathonCertificate.create({
            data: {
              certificateCode: code,
              hackathonId: hackathon.id,
              userId: reg.userId,
              recipientName: reg.name,
              role: "PARTICIPANT",
              issueDate: new Date(),
            },
          });
          generatedCount++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      generatedCount,
      message: `Successfully generated ${generatedCount} certificates!`,
    });
  } catch (error: any) {
    console.error("Certificate generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate certificates." },
      { status: 500 }
    );
  }
}
