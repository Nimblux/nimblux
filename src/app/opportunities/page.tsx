import React from "react";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import SearchBar from "@/components/filters/SearchBar";
import FilterSidebar from "@/components/filters/FilterSidebar";
import OpportunityCard from "@/components/cards/OpportunityCard";
import { CATEGORIES } from "@/lib/constants";
import { getCurrentUser } from "@/lib/auth";
import { Compass, Sparkles, Inbox } from "lucide-react";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Explore Opportunities | NIMBLUX",
  description:
    "Browse verified internships, hackathons, jobs, events, and scholarships with advanced filters for students.",
};

interface PageProps {
  searchParams: {
    q?: string;
    category?: string;
    mode?: string;
    paid?: string;
    sort?: string;
    featured?: string;
  };
}

export default async function OpportunitiesPage({ searchParams }: PageProps) {
  const { q, category, mode, paid, sort = "latest", featured } = searchParams;

  const currentUser = await getCurrentUser();

  // Query conditions
  const where: any = {
    status: "APPROVED",
  };

  if (category && category !== "all") {
    where.category = category.toLowerCase();
  }

  if (mode && mode !== "all") {
    where.mode = mode.toUpperCase();
  }

  if (paid === "paid") {
    where.isPaid = true;
  } else if (paid === "free") {
    where.isPaid = false;
  }

  if (featured === "true") {
    where.featured = true;
  }

  if (q && q.trim()) {
    const term = q.trim().toLowerCase();
    where.OR = [
      { title: { contains: term } },
      { organization: { contains: term } },
      { description: { contains: term } },
      { skills: { contains: term } },
      { location: { contains: term } },
      { eligibility: { contains: term } },
    ];
  }

  // Order conditions
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

  const activeCategoryMeta = CATEGORIES.find(
    (c) => c.slug.toLowerCase() === category?.toLowerCase()
  );

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Compass className="w-4 h-4" />
          <span>Opportunity Directory</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white">
          {activeCategoryMeta
            ? activeCategoryMeta.name
            : "Explore All Opportunities"}
        </h1>
        <p className="mt-2 text-sm text-slate-400 max-w-2xl">
          {activeCategoryMeta
            ? activeCategoryMeta.description
            : "Discover verified student tech opportunities, internships, hackathons, and grants from top organizations worldwide."}
        </p>
      </div>

      {/* Top Search Bar */}
      <div className="mb-8">
        <SearchBar
          initialQuery={q}
          initialCategory={category}
          initialMode={mode}
        />
      </div>

      {/* Main Layout: Sidebar Filters + Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Filter Sidebar */}
        <div className="lg:col-span-1">
          <FilterSidebar
            selectedCategory={category || "all"}
            selectedMode={mode || "all"}
            selectedPaid={paid || "all"}
            selectedSort={sort}
          />
        </div>

        {/* Results Grid */}
        <div className="lg:col-span-3">
          {/* Results Summary Bar */}
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-800 text-xs text-slate-400">
            <div>
              Showing <span className="font-bold text-white">{opportunities.length}</span>{" "}
              open {opportunities.length === 1 ? "opportunity" : "opportunities"}
            </div>
            {q && (
              <div>
                Filtered by: <span className="text-indigo-300 font-medium">"{q}"</span>
              </div>
            )}
          </div>

          {/* Cards Grid */}
          {opportunities.length === 0 ? (
            <div className="text-center py-20 rounded-2xl glass-panel border border-slate-800 p-8 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
                <Inbox className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">
                No matching opportunities found
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Try adjusting your search terms, clearing filter restrictions, or explore other opportunity categories.
              </p>
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
