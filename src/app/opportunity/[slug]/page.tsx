import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import OpportunityDetailClient from "./OpportunityDetailClient";

export const revalidate = 0;

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const opportunity = await prisma.opportunity.findFirst({
    where: {
      OR: [{ slug: params.slug }, { id: params.slug }],
    },
  });

  if (!opportunity) {
    return { title: "Opportunity Not Found | NIMBLUX" };
  }

  return {
    title: `${opportunity.title} at ${opportunity.organization} | NIMBLUX`,
    description: opportunity.description.slice(0, 160),
    openGraph: {
      title: `${opportunity.title} — ${opportunity.organization}`,
      description: opportunity.description.slice(0, 160),
      images: opportunity.banner ? [opportunity.banner] : [],
    },
  };
}

export default async function OpportunityDetailPage({ params }: PageProps) {
  const currentUser = await getCurrentUser();

  const opportunity = await prisma.opportunity.findFirst({
    where: {
      OR: [{ slug: params.slug }, { id: params.slug }],
    },
    include: {
      createdBy: {
        select: { id: true, name: true, profileImage: true, college: true },
      },
    },
  });

  if (!opportunity) {
    notFound();
  }

  // Related opportunities
  const related = await prisma.opportunity.findMany({
    where: {
      category: opportunity.category,
      status: "APPROVED",
      id: { not: opportunity.id },
    },
    take: 3,
    orderBy: { createdAt: "desc" },
  });

  let isBookmarked = false;
  if (currentUser) {
    const bookmark = await prisma.bookmark.findUnique({
      where: {
        userId_opportunityId: {
          userId: currentUser.id,
          opportunityId: opportunity.id,
        },
      },
    });
    isBookmarked = Boolean(bookmark);
  }

  // JSON-LD structured schema for rich Google search cards
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": opportunity.category === "jobs" || opportunity.category === "internships" ? "JobPosting" : "Event",
    name: opportunity.title,
    title: opportunity.title,
    description: opportunity.description,
    hiringOrganization: {
      "@type": "Organization",
      name: opportunity.organization,
      logo: opportunity.logo || undefined,
    },
    jobLocation: {
      "@type": "Place",
      address: opportunity.location,
    },
    validThrough: opportunity.deadline.toISOString(),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <OpportunityDetailClient
        opportunity={opportunity as any}
        related={related as any}
        initialSaved={isBookmarked}
      />
    </>
  );
}
