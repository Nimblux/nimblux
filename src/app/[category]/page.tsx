import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CATEGORIES } from "@/lib/constants";
import OpportunityCard from "@/components/cards/OpportunityCard";
import FilterSidebar from "@/components/filters/FilterSidebar";
import SearchBar from "@/components/filters/SearchBar";
import { getCurrentUser } from "@/lib/auth";
import { Compass, Sparkles, Inbox, ArrowLeft } from "lucide-react";
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

  // If slug doesn't match a known category, trigger 404
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

  // User bookmarks
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
          className="inline-flex items-center space-x-1 text-xs text-slate-400 hover:text-indigo-300 font-medium mb-3 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Categories</span>
        </Link>
        <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4" />
          <span>Curated Category</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white">
          {categoryMeta.name}
        </h1>
        <p className="mt-2 text-sm text-slate-400 max-w-2xl">
          {categoryMeta.description}
        </p>
      </div>

      {/* Top Search Bar with current category pre-selected */}
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
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-800 text-xs text-slate-400">
            <div>
              Showing <span className="font-bold text-white">{opportunities.length}</span>{" "}
              {categoryMeta.name.toLowerCase()}
            </div>
            {q && (
              <div>
                Filtered by: <span className="text-indigo-300 font-medium">"{q}"</span>
              </div>
            )}
          </div>

          {opportunities.length === 0 ? (
            <div className="text-center py-20 rounded-2xl glass-panel border border-slate-800 p-8 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
                <Inbox className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">
                No opportunities found in this category
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Be the first to submit an opportunity in {categoryMeta.name} for the student community.
              </p>
              <div className="pt-2">
                <Link
                  href="/submit-opportunity"
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-md shadow-indigo-600/20"
                >
                  <span>Post an Opportunity</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
