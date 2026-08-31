import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const code = params.code.toUpperCase();

    const certificate = await prisma.hackathonCertificate.findUnique({
      where: { certificateCode: code },
      include: {
        hackathon: {
          select: {
            id: true,
            title: true,
            slug: true,
            organizerName: true,
            organizerLogo: true,
            startDate: true,
            endDate: true,
            mode: true,
            location: true,
          },
        },
        user: {
          select: { id: true, name: true, college: true },
        },
      },
    });

    if (!certificate) {
      return NextResponse.json(
        { valid: false, error: "Certificate not found. The code may be invalid or revoked." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      valid: true,
      certificate: {
        certificateCode: certificate.certificateCode,
        recipientName: certificate.recipientName,
        role: certificate.role,
        prizeTitle: certificate.prizeTitle,
        issueDate: certificate.issueDate,
        hackathonTitle: certificate.hackathon.title,
        hackathonSlug: certificate.hackathon.slug,
        organizerName: certificate.hackathon.organizerName,
        organizerLogo: certificate.hackathon.organizerLogo,
        startDate: certificate.hackathon.startDate,
        endDate: certificate.hackathon.endDate,
        issuer: "NIMBLUX Official Verification Registry",
        verificationUrl: `https://nimblux.xyz/certificate/${certificate.certificateCode}`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to verify certificate." },
      { status: 500 }
    );
  }
}
