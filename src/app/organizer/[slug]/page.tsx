import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  Building2,
  ShieldCheck,
  Globe,
  Mail,
  MapPin,
  Linkedin,
  Twitter,
  Github,
  Calendar,
  Briefcase,
  Code,
  Sparkles,
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import OpportunityCard, { OpportunityCardData } from "@/components/cards/OpportunityCard";
import HackathonCard, { HackathonCardData } from "@/components/cards/HackathonCard";

export const revalidate = 60;

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const decodedSlug = decodeURIComponent(params.slug).replace(/-/g, " ");

  const organizer = await prisma.user.findFirst({
    where: {
      OR: [
        { id: params.slug },
        { organizationName: { equals: decodedSlug, mode: "insensitive" } },
        { name: { equals: decodedSlug, mode: "insensitive" } },
      ],
    },
    select: {
      organizationName: true,
      name: true,
      organizationBio: true,
      organizationLogo: true,
      profileImage: true,
    },
  });

  if (!organizer) {
    return { title: "Organizer Not Found | NIMBLUX" };
  }

  const name = organizer.organizationName || organizer.name;
  return {
    title: `${name} — Organizer Profile | NIMBLUX`,
    description: organizer.organizationBio || `Discover opportunities and hackathons hosted by ${name} on NIMBLUX.`,
    openGraph: {
      title: `${name} on NIMBLUX`,
      description: organizer.organizationBio || `Discover verified opportunities hosted by ${name}.`,
      images: organizer.organizationLogo || organizer.profileImage ? [organizer.organizationLogo || organizer.profileImage!] : [],
    },
  };
}

export default async function OrganizerPublicProfilePage({ params }: PageProps) {
  const decodedSlug = decodeURIComponent(params.slug).replace(/-/g, " ");

  const organizer = await prisma.user.findFirst({
    where: {
      OR: [
        { id: params.slug },
        { organizationName: { equals: decodedSlug, mode: "insensitive" } },
        { name: { equals: decodedSlug, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      name: true,
      email: true,
      profileImage: true,
      organizationName: true,
      organizationLogo: true,
      organizationBio: true,
      organizationWebsite: true,
      organizationEmail: true,
      organizationLocation: true,
      organizationType: true,
      organizationLinkedin: true,
      organizationTwitter: true,
      organizationGithub: true,
      isVerifiedOrganizer: true,
      createdAt: true,
    },
  });

  if (!organizer) {
    notFound();
  }

  // Fetch approved opportunities hosted by this organizer
  const opportunities = await prisma.opportunity.findMany({
    where: {
      createdById: organizer.id,
      status: "APPROVED",
    },
    orderBy: { createdAt: "desc" },
    include: {
      createdBy: {
        select: { id: true, name: true, profileImage: true },
      },
      _count: {
        select: {
          applications: true,
          registrations: true,
        },
      },
    },
  });

  // Fetch approved hackathons hosted by this organizer
  const hackathons = await prisma.hackathon.findMany({
    where: {
      createdById: organizer.id,
      status: "APPROVED",
    },
    orderBy: { createdAt: "desc" },
    include: {
      createdBy: {
        select: { id: true, name: true, profileImage: true },
      },
      _count: {
        select: {
          registrations: true,
          teams: true,
          submissions: true,
        },
      },
    },
  });

  const displayName = organizer.organizationName || organizer.name;
  const displayLogo = organizer.organizationLogo || organizer.profileImage;

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-10">
      {/* Organizer Profile Header Card */}
      <div className="rounded-[20px] bg-[#111615] border border-white/[0.08] p-6 sm:p-10 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="flex items-start space-x-5">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[16px] bg-[#0E1110] border border-white/[0.12] flex items-center justify-center font-bold text-[#D8B77A] text-2xl overflow-hidden flex-shrink-0 shadow-lg">
              {displayLogo ? (
                <img
                  src={displayLogo}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                displayName.slice(0, 2).toUpperCase()
              )}
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F1E8] tracking-tight">
                  {displayName}
                </h1>
                {organizer.isVerifiedOrganizer && (
                  <span
                    className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-[6px] text-xs font-mono font-medium text-[#8FA58E] bg-[#8FA58E]/10 border border-[#8FA58E]/30"
                    title="Verified by NIMBLUX"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verified Host</span>
                  </span>
                )}
                {organizer.organizationType && (
                  <span className="px-2 py-0.5 rounded-[5px] text-[10px] font-mono text-[#A9AAA5] bg-white/[0.04] border border-white/[0.06] uppercase">
                    {organizer.organizationType}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-[#A9AAA5] font-mono">
                {organizer.organizationLocation && (
                  <span className="flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-[#7E807B]" />
                    <span>{organizer.organizationLocation}</span>
                  </span>
                )}
                {organizer.organizationWebsite && (
                  <a
                    href={organizer.organizationWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-[#D8B77A] hover:underline"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>{organizer.organizationWebsite.replace(/^https?:\/\//, "")}</span>
                  </a>
                )}
                <span>•</span>
                <span>Active since {new Date(organizer.createdAt).getFullYear()}</span>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex items-center space-x-2 self-start">
            {organizer.organizationLinkedin && (
              <a
                href={organizer.organizationLinkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-[8px] bg-white/[0.04] hover:bg-white/[0.08] text-[#A9AAA5] hover:text-[#F5F1E8] transition-colors"
                title="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            )}
            {organizer.organizationTwitter && (
              <a
                href={organizer.organizationTwitter}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-[8px] bg-white/[0.04] hover:bg-white/[0.08] text-[#A9AAA5] hover:text-[#F5F1E8] transition-colors"
                title="Twitter / X"
              >
                <Twitter className="w-4 h-4" />
              </a>
            )}
            {organizer.organizationGithub && (
              <a
                href={organizer.organizationGithub}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-[8px] bg-white/[0.04] hover:bg-white/[0.08] text-[#A9AAA5] hover:text-[#F5F1E8] transition-colors"
                title="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Bio */}
        {organizer.organizationBio && (
          <div className="pt-4 border-t border-white/[0.06] text-xs text-[#A9AAA5] leading-relaxed max-w-3xl whitespace-pre-line">
            {organizer.organizationBio}
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-white/[0.06]">
          <div className="p-3.5 rounded-[12px] bg-[#0E1110] border border-white/[0.04]">
            <div className="text-[10.5px] font-mono text-[#A9AAA5] uppercase tracking-wider">
              Published Opportunities
            </div>
            <div className="text-xl font-bold text-[#F5F1E8] mt-1 font-mono">
              {opportunities.length}
            </div>
          </div>

          <div className="p-3.5 rounded-[12px] bg-[#0E1110] border border-white/[0.04]">
            <div className="text-[10.5px] font-mono text-[#A9AAA5] uppercase tracking-wider">
              Hosted Hackathons
            </div>
            <div className="text-xl font-bold text-[#D8B77A] mt-1 font-mono">
              {hackathons.length}
            </div>
          </div>

          <div className="p-3.5 rounded-[12px] bg-[#0E1110] border border-white/[0.04] col-span-2 sm:col-span-1">
            <div className="text-[10.5px] font-mono text-[#A9AAA5] uppercase tracking-wider">
              Verification Status
            </div>
            <div className="text-sm font-semibold text-[#8FA58E] mt-1.5 flex items-center space-x-1">
              <ShieldCheck className="w-4 h-4" />
              <span>{organizer.isVerifiedOrganizer ? "Verified Host" : "Standard Host"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Opportunities Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
          <div className="flex items-center space-x-2">
            <Briefcase className="w-4 h-4 text-[#D8B77A]" />
            <h2 className="text-lg font-bold text-[#F5F1E8]">
              Published Opportunities ({opportunities.length})
            </h2>
          </div>
        </div>

        {opportunities.length === 0 ? (
          <div className="p-8 rounded-[14px] bg-[#111615] border border-white/[0.06] text-center text-xs text-[#A9AAA5]">
            No live opportunities currently published by this organization.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {opportunities.map((opp) => (
              <OpportunityCard
                key={opp.id}
                opportunity={{
                  ...opp,
                  isBookmarked: false,
                } as any}
              />
            ))}
          </div>
        )}
      </div>

      {/* Hosted Hackathons Section */}
      {hackathons.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
            <div className="flex items-center space-x-2">
              <Code className="w-4 h-4 text-[#8FA58E]" />
              <h2 className="text-lg font-bold text-[#F5F1E8]">
                Hosted Hackathons ({hackathons.length})
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hackathons.map((h) => (
              <HackathonCard
                key={h.id}
                hackathon={{
                  ...h,
                  isRegistered: false,
                } as any}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
