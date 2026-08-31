import React from "react";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import HackathonsClient from "./HackathonsClient";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Hackathons for Builders & Students | NIMBLUX",
  description:
    "Discover, organize, and participate in global software hackathons, AI challenges, and student coding competitions on NIMBLUX. Form teams, submit projects, and win prize pools.",
  openGraph: {
    title: "Hackathons on NIMBLUX — Build, Compete & Win",
    description:
      "Join online and onsite hackathons, build student teams, and compete for verified prize pools and official certificates.",
  },
};

export default async function HackathonsPage() {
  const currentUser = await getCurrentUser();

  const hackathons = await prisma.hackathon.findMany({
    where: {
      status: { in: ["PUBLISHED", "APPROVED", "COMPLETED"] },
    },
    orderBy: { createdAt: "desc" },
    include: {
      tracks: { select: { id: true, name: true } },
      prizes: { select: { id: true, name: true, amount: true, currency: true } },
      _count: {
        select: {
          registrations: true,
          teams: true,
          submissions: true,
        },
      },
    },
  });

  let userRegisteredIds = new Set<string>();
  if (currentUser) {
    const userRegs = await prisma.hackathonRegistration.findMany({
      where: { userId: currentUser.id },
      select: { hackathonId: true },
    });
    userRegisteredIds = new Set(userRegs.map((r) => r.hackathonId));
  }

  const enrichedHackathons = hackathons.map((h) => ({
    id: h.id,
    title: h.title,
    slug: h.slug,
    tagline: h.tagline,
    shortDescription: h.shortDescription,
    coverImage: h.coverImage,
    logo: h.logo,
    organizerName: h.organizerName,
    organizerLogo: h.organizerLogo,
    mode: h.mode,
    location: h.location,
    startDate: h.startDate.toISOString(),
    endDate: h.endDate.toISOString(),
    regEndDate: h.regEndDate.toISOString(),
    submissionDeadline: h.submissionDeadline.toISOString(),
    hasPrizePool: h.hasPrizePool,
    totalPrizePool: h.totalPrizePool,
    prizeCurrency: h.prizeCurrency,
    status: h.status,
    featured: h.featured,
    verified: h.verified,
    registrationCount: h._count.registrations,
    teamCount: h._count.teams,
    submissionCount: h._count.submissions,
    isUserRegistered: userRegisteredIds.has(h.id),
    isExternalRegistration: h.isExternalRegistration,
    externalRegistrationUrl: h.externalRegistrationUrl,
  }));

  return <HackathonsClient initialHackathons={enrichedHackathons as any} />;
}
