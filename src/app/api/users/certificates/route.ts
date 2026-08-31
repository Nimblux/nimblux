import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();

    const [universalCerts, hackathonCerts] = await Promise.all([
      prisma.certificate.findMany({
        where: { userId: user.id },
        orderBy: { issueDate: "desc" },
        include: {
          opportunity: {
            select: {
              id: true,
              title: true,
              slug: true,
              organization: true,
              logo: true,
            },
          },
        },
      }),
      prisma.hackathonCertificate.findMany({
        where: { userId: user.id },
        orderBy: { issueDate: "desc" },
        include: {
          hackathon: {
            select: {
              id: true,
              title: true,
              slug: true,
              organizerName: true,
              logo: true,
            },
          },
        },
      }),
    ]);

    // Format into standard certificate schema
    const formattedUniversal = universalCerts.map((c) => ({
      id: c.id,
      certificateCode: c.certificateCode,
      recipientName: c.recipientName,
      opportunityTitle: c.opportunityTitle,
      opportunityType: c.opportunityType,
      organizationName: c.organizationName,
      role: c.role,
      prizeTitle: c.prizeTitle,
      issueDate: c.issueDate,
      slug: c.opportunity?.slug,
      verificationUrl: `/certificate/${c.certificateCode}`,
    }));

    const formattedHackathon = hackathonCerts.map((c) => ({
      id: c.id,
      certificateCode: c.certificateCode,
      recipientName: c.recipientName,
      opportunityTitle: c.hackathon.title,
      opportunityType: "HACKATHON",
      organizationName: c.hackathon.organizerName,
      role: c.role,
      prizeTitle: c.prizeTitle,
      issueDate: c.issueDate,
      slug: c.hackathon.slug,
      verificationUrl: `/certificate/${c.certificateCode}`,
    }));

    const allCertificates = [...formattedUniversal, ...formattedHackathon];

    return NextResponse.json({ certificates: allCertificates });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: error.message || "Failed to fetch certificates" },
      { status: 500 }
    );
  }
}
