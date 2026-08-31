import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import HackathonDetailClient from "./HackathonDetailClient";

export const revalidate = 0;

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const hackathon = await prisma.hackathon.findFirst({
    where: {
      OR: [{ slug: params.slug }, { id: params.slug }],
    },
  });

  if (!hackathon) {
    return { title: "Hackathon Not Found | NIMBLUX" };
  }

  return {
    title: `${hackathon.title} — Organized by ${hackathon.organizerName} | NIMBLUX`,
    description: hackathon.shortDescription.slice(0, 160),
    openGraph: {
      title: `${hackathon.title} | Global Hackathon on NIMBLUX`,
      description: hackathon.shortDescription.slice(0, 160),
      images: hackathon.coverImage ? [hackathon.coverImage] : [],
    },
  };
}

export default async function HackathonDetailPage({ params }: PageProps) {
  const currentUser = await getCurrentUser();

  const hackathon = await prisma.hackathon.findFirst({
    where: {
      OR: [{ slug: params.slug }, { id: params.slug }],
    },
    include: {
      createdBy: {
        select: { id: true, name: true, profileImage: true, college: true },
      },
      tracks: { orderBy: { createdAt: "asc" } },
      prizes: { orderBy: { displayOrder: "asc" } },
      criteria: { orderBy: { createdAt: "asc" } },
      sponsors: { orderBy: { createdAt: "asc" } },
      announcements: { orderBy: [{ pinned: "desc" }, { createdAt: "desc" }] },
      winners: {
        include: {
          prize: true,
          team: {
            include: {
              members: {
                include: { user: { select: { id: true, name: true, profileImage: true, college: true } } },
              },
            },
          },
          submission: true,
        },
        orderBy: { rank: "asc" },
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

  if (!hackathon) {
    notFound();
  }

  let userRegistration = null;
  let userTeam = null;
  let userSubmission = null;
  let isJudge = false;

  if (currentUser) {
    userRegistration = await prisma.hackathonRegistration.findUnique({
      where: {
        hackathonId_userId: {
          hackathonId: hackathon.id,
          userId: currentUser.id,
        },
      },
      include: {
        team: {
          include: {
            members: {
              include: { user: { select: { id: true, name: true, profileImage: true, college: true } } },
            },
            leader: true,
            submission: true,
          },
        },
      },
    });

    if (userRegistration?.team) {
      userTeam = userRegistration.team;
      userSubmission = userRegistration.team.submission;
    } else {
      userSubmission = await prisma.hackathonSubmission.findFirst({
        where: {
          hackathonId: hackathon.id,
          userId: currentUser.id,
        },
      });
    }

    const judgeRecord = await prisma.hackathonJudge.findUnique({
      where: {
        hackathonId_userId: {
          hackathonId: hackathon.id,
          userId: currentUser.id,
        },
      },
    });
    isJudge = Boolean(judgeRecord);
  }

  const isOrganizer = currentUser ? currentUser.id === hackathon.createdById : false;
  const isAdmin = currentUser ? currentUser.role === "ADMIN" : false;

  // JSON-LD structured schema for search engines
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: hackathon.title,
    description: hackathon.shortDescription,
    startDate: hackathon.startDate.toISOString(),
    endDate: hackathon.endDate.toISOString(),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode:
      hackathon.mode === "ONLINE"
        ? "https://schema.org/OnlineEventAttendanceMode"
        : hackathon.mode === "OFFLINE"
        ? "https://schema.org/OfflineEventAttendanceMode"
        : "https://schema.org/MixedEventAttendanceMode",
    location: {
      "@type": "Place",
      name: hackathon.location,
    },
    organizer: {
      "@type": "Organization",
      name: hackathon.organizerName,
      logo: hackathon.organizerLogo || undefined,
    },
    offers: {
      "@type": "Offer",
      price: hackathon.isPaid ? hackathon.registrationFee : "0",
      priceCurrency: hackathon.prizeCurrency || "INR",
      availability: hackathon.isRegistrationOpen
        ? "https://schema.org/InStock"
        : "https://schema.org/SoldOut",
      validThrough: hackathon.regEndDate.toISOString(),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HackathonDetailClient
        hackathon={{
          ...hackathon,
          registrationCount: hackathon._count.registrations,
          teamCount: hackathon._count.teams,
          submissionCount: hackathon._count.submissions,
        }}
        userState={{
          isRegistered: Boolean(userRegistration),
          registration: userRegistration,
          team: userTeam,
          submission: userSubmission,
          isOrganizer,
          isAdmin,
          isJudge,
        }}
        currentUser={currentUser}
      />
    </>
  );
}
