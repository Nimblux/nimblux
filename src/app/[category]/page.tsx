import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CATEGORIES } from "@/lib/constants";
import OpportunityCard from "@/components/cards/OpportunityCard";
import FilterSidebar from "@/components/filters/FilterSidebar";
import SearchBar from "@/components/filters/SearchBar";
import { getCurrentUser } from "@/lib/auth";
import { Sparkles, Inbox, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const revalidate = 0;

interface CategoryPageProps {
  params: { category: string };
  searchParams: {
    q?: string;
    mode?: string;
    paid?: string;
    sort?: string;
  };
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const categoryMeta = CATEGORIES.find(
    (c) => c.slug.toLowerCase() === params.category.toLowerCase()
  );

  if (!categoryMeta) {
    return { title: "Category Not Found | NIMBLUX" };
  }

  return {
    title: `${categoryMeta.name} for Students | NIMBLUX`,
    description: categoryMeta.description,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const categorySlug = params.category.toLowerCase();
  const categoryMeta = CATEGORIES.find((c) => c.slug === categorySlug);

  if (!categoryMeta) {
    notFound();
  }

  const { q, mode, paid, sort = "latest" } = searchParams;
  const currentUser = await getCurrentUser();

  const where: any = {
    category: categorySlug,
    status: "APPROVED",
  };

  if (mode && mode !== "all") {
    where.mode = mode.toUpperCase();
  }

  if (paid === "paid") {
    where.isPaid = true;
  } else if (paid === "free") {
    where.isPaid = false;
  }

  if (q && q.trim()) {
    const term = q.trim().toLowerCase();
    where.OR = [
      { title: { contains: term } },
      { organization: { contains: term } },
      { description: { contains: term } },
      { skills: { contains: term } },
      { location: { contains: term } },
    ];
  }

  let orderBy: any = { createdAt: "desc" };
  if (sort === "deadline") {
    orderBy = { deadline: "asc" };
  } else if (sort === "popular") {
    orderBy = { clicksCount: "desc" };
  } else if (sort === "featured") {
    orderBy = [{ featured: "desc" }, { createdAt: "desc" }];
  }

  const opportunities = await prisma.opportunity.findMany({
    where,
    orderBy,
    include: {
      createdBy: {
        select: { id: true, name: true, profileImage: true },
      },
    },
  });

  let bookmarkedIds = new Set<string>();
  if (currentUser) {
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: currentUser.id },
      select: { opportunityId: true },
    });
    bookmarkedIds = new Set(bookmarks.map((b) => b.opportunityId));
  }

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Category Header */}
      <div className="mb-8">
        <Link
          href="/opportunities"
          className="inline-flex items-center space-x-1.5 text-xs text-ivory-500 hover:text-bronze-300 font-mono mb-3 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Categories</span>
        </Link>
        <div className="flex items-center space-x-2 text-bronze-400 text-xs font-mono uppercase tracking-wider mb-1.5 font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Curated Track</span>
        </div>
        <h1 className="font-serif-heading font-medium text-3xl sm:text-4xl text-ivory-100 tracking-tight">
          {categoryMeta.name}
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-ivory-400 max-w-2xl leading-relaxed">
          {categoryMeta.description}
        </p>
      </div>

      {/* Top Search Bar */}
      <div className="mb-8">
        <SearchBar
          initialQuery={q}
          initialCategory={categorySlug}
          initialMode={mode}
        />
      </div>

      {/* Main Layout: Sidebar Filters + Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        <div className="lg:col-span-1">
          <FilterSidebar
            selectedCategory={categorySlug}
            selectedMode={mode || "all"}
            selectedPaid={paid || "all"}
            selectedSort={sort}
          />
        </div>

        <div className="lg:col-span-3">
          {/* Results Summary Bar */}
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-charcoal-cardBorder text-xs text-ivory-500 font-mono">
            <div>
              Showing <span className="font-bold text-ivory-100">{opportunities.length}</span>{" "}
              {categoryMeta.name.toLowerCase()}
            </div>
            {q && (
              <div>
                Filtered by: <span className="text-bronze-300 font-medium">"{q}"</span>
              </div>
            )}
          </div>

          {opportunities.length === 0 ? (
            <div className="text-center py-20 rounded-3xl bg-charcoal-card border border-charcoal-cardBorder p-8 space-y-3 shadow-card">
              <div className="w-14 h-14 rounded-2xl bg-charcoal-900 border border-charcoal-cardBorder flex items-center justify-center mx-auto text-ivory-500">
                <Inbox className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-ivory-100">
                No opportunities found in this category
              </h3>
              <p className="text-xs text-ivory-500 max-w-md mx-auto leading-relaxed">
                Be the first to submit an opportunity in {categoryMeta.name} for the student community.
              </p>
              <div className="pt-2">
                <Link
                  href="/submit-opportunity"
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs text-charcoal-950 bg-bronze-500 hover:bg-bronze-400 transition-all shadow-button"
                >
                  <span>Post an Opportunity</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {opportunities.map((opp) => (
                <OpportunityCard
                  key={opp.id}
                  opportunity={{
                    ...opp,
                    isBookmarked: bookmarkedIds.has(opp.id),
                  } as any}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
