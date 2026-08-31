import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const code = params.code.toUpperCase();

    // 1. Try universal Certificate
    const universalCert = await prisma.certificate.findUnique({
      where: { certificateCode: code },
      include: {
        opportunity: {
          select: {
            id: true,
            title: true,
            slug: true,
            organization: true,
            logo: true,
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

    if (universalCert) {
      return NextResponse.json({
        valid: true,
        certificate: {
          certificateCode: universalCert.certificateCode,
          recipientName: universalCert.recipientName,
          role: universalCert.role,
          prizeTitle: universalCert.prizeTitle,
          issueDate: universalCert.issueDate,
          opportunityTitle: universalCert.opportunityTitle,
          opportunityType: universalCert.opportunityType,
          opportunitySlug: universalCert.opportunity?.slug,
          organizationName: universalCert.organizationName,
          organizationLogo: universalCert.opportunity?.logo,
          issuer: "NIMBLUX Platform Registry",
          verificationUrl: `https://nimblux.xyz/certificate/${universalCert.certificateCode}`,
        },
      });
    }

    // 2. Try legacy HackathonCertificate
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
        opportunityTitle: certificate.hackathon.title,
        opportunityType: "HACKATHON",
        opportunitySlug: certificate.hackathon.slug,
        organizationName: certificate.hackathon.organizerName,
        organizationLogo: certificate.hackathon.organizerLogo,
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
