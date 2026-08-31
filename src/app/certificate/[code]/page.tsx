import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ShieldCheck, Sparkles, Trophy, Calendar, CheckCircle2, Download, Printer, ArrowRight } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const revalidate = 0;

interface PageProps {
  params: { code: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const code = params.code.toUpperCase();

  const [universalCert, hackathonCert] = await Promise.all([
    prisma.certificate.findUnique({
      where: { certificateCode: code },
      include: { opportunity: true, user: true },
    }),
    prisma.hackathonCertificate.findUnique({
      where: { certificateCode: code },
      include: { hackathon: true, user: true },
    }),
  ]);

  const cert = universalCert || hackathonCert;

  if (!cert) {
    return { title: "Certificate Not Found | NIMBLUX" };
  }

  const title = "opportunityTitle" in cert ? cert.opportunityTitle : cert.hackathon.title;

  return {
    title: `Verified Certificate: ${cert.recipientName} — ${title} | NIMBLUX`,
    description: `Official verifiable certificate issued to ${cert.recipientName} for ${title}. Verified on the NIMBLUX platform registry.`,
  };
}

export default async function CertificateVerificationPage({ params }: PageProps) {
  const code = params.code.toUpperCase();

  const [universalCert, hackathonCert] = await Promise.all([
    prisma.certificate.findUnique({
      where: { certificateCode: code },
      include: {
        opportunity: true,
        user: {
          select: { id: true, name: true, profileImage: true, college: true },
        },
      },
    }),
    prisma.hackathonCertificate.findUnique({
      where: { certificateCode: code },
      include: {
        hackathon: true,
        user: {
          select: { id: true, name: true, profileImage: true, college: true },
        },
      },
    }),
  ]);

  if (!universalCert && !hackathonCert) {
    notFound();
  }

  const certData = universalCert
    ? {
        code: universalCert.certificateCode,
        recipientName: universalCert.recipientName,
        role: universalCert.role,
        prizeTitle: universalCert.prizeTitle,
        title: universalCert.opportunityTitle,
        type: universalCert.opportunityType,
        organization: universalCert.organizationName,
        issueDate: universalCert.issueDate,
        college: universalCert.user?.college,
        slug: universalCert.opportunity?.slug,
        linkPrefix: "/opportunity",
      }
    : {
        code: hackathonCert!.certificateCode,
        recipientName: hackathonCert!.recipientName,
        role: hackathonCert!.role,
        prizeTitle: hackathonCert!.prizeTitle,
        title: hackathonCert!.hackathon.title,
        type: "HACKATHON",
        organization: hackathonCert!.hackathon.organizerName,
        issueDate: hackathonCert!.issueDate,
        college: hackathonCert!.user?.college,
        slug: hackathonCert!.hackathon.slug,
        linkPrefix: "/hackathons",
      };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      {/* Verification Status Banner */}
      <div className="p-4 rounded-2xl bg-forest-500/10 border border-forest-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2.5 text-forest-300">
          <ShieldCheck className="w-5 h-5 flex-shrink-0" />
          <div>
            <span className="font-bold">Official Verified Credential</span>
            <span className="text-forest-400 block text-[11px]">
              Cryptographically registered on NIMBLUX Platform Registry
            </span>
          </div>
        </div>

        <div className="font-mono text-[11px] text-forest-300 bg-forest-500/15 px-3 py-1 rounded-lg self-start sm:self-center border border-forest-500/25">
          ID: {certData.code}
        </div>
      </div>

      {/* Official Certificate Card (Printable Layout) */}
      <div className="relative rounded-3xl bg-gradient-to-b from-charcoal-card via-charcoal-card to-charcoal-900 border-2 border-bronze-500/40 p-8 sm:p-14 shadow-2xl space-y-8 text-center overflow-hidden">
        {/* Certificate Watermark / Ambient Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-bronze-radial opacity-10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-forest-radial opacity-10 blur-3xl pointer-events-none" />

        {/* Certificate Header Branding */}
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 text-bronze-400 text-xs font-mono font-bold tracking-widest uppercase">
            <Sparkles className="w-4 h-4" />
            <span>NIMBLUX VERIFIED CREDENTIAL</span>
            <Sparkles className="w-4 h-4" />
          </div>
          <h1 className="font-serif-heading font-normal text-2xl sm:text-4xl text-ivory-100 tracking-wide">
            Certificate of {certData.role === "WINNER" ? "Excellence & Victory" : certData.role === "COMPLETION" ? "Completion" : "Participation"}
          </h1>
          <p className="text-xs font-mono text-ivory-500 uppercase tracking-wider">
            This is proudly presented to
          </p>
        </div>

        {/* Recipient Name */}
        <div className="py-2">
          <div className="font-serif-heading font-medium text-3xl sm:text-5xl text-amber-300 underline decoration-bronze-500/40 decoration-1 underline-offset-8">
            {certData.recipientName}
          </div>
          {certData.college && (
            <p className="text-xs text-ivory-400 font-mono mt-2">{certData.college}</p>
          )}
        </div>

        {/* Achievement / Description */}
        <div className="max-w-xl mx-auto space-y-2 text-xs sm:text-sm text-ivory-300 leading-relaxed">
          <p>
            for outstanding {certData.role === "WINNER" ? "achievement and victory in" : "dedication, engineering collaboration, and participation in"}
          </p>
          <div className="font-bold text-base sm:text-lg text-ivory-100 font-serif-heading">
            {certData.title}
          </div>
          {certData.prizeTitle && (
            <div className="inline-flex items-center space-x-1.5 px-4 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono font-bold text-xs mt-1">
              <Trophy className="w-3.5 h-3.5" />
              <span>{certData.prizeTitle}</span>
            </div>
          )}
        </div>

        {/* Signatures & Seal Row */}
        <div className="pt-8 border-t border-charcoal-cardBorder/80 grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
          <div className="text-center sm:text-left space-y-1">
            <div className="font-serif-heading text-ivory-200 text-sm italic">
              {certData.organization}
            </div>
            <div className="text-[10px] font-mono text-ivory-500 uppercase">Issuing Organization</div>
          </div>

          {/* Golden Holographic Verification Seal */}
          <div className="flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 p-0.5 shadow-editorial">
              <div className="w-full h-full rounded-full bg-charcoal-950 flex items-center justify-center text-amber-300 flex-col space-y-0.5">
                <ShieldCheck className="w-6 h-6" />
                <span className="text-[7px] font-mono font-bold tracking-tighter uppercase">VERIFIED</span>
              </div>
            </div>
          </div>

          <div className="text-center sm:text-right space-y-1">
            <div className="font-mono text-xs text-ivory-200">{formatDate(certData.issueDate)}</div>
            <div className="text-[10px] font-mono text-ivory-500 uppercase">Date Issued</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        {certData.slug && (
          <Link
            href={`${certData.linkPrefix}/${certData.slug}`}
            className="inline-flex items-center space-x-1 text-ivory-400 hover:text-ivory-200 font-mono"
          >
            <span>View Opportunity Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}

        <div className="flex items-center space-x-3">
          <Link
            href="/opportunities"
            className="px-5 py-2.5 rounded-xl font-bold text-charcoal-950 bg-bronze-500 hover:bg-bronze-400 shadow-button transition-all"
          >
            Explore More Opportunities
          </Link>
        </div>
      </div>
    </div>
  );
}
