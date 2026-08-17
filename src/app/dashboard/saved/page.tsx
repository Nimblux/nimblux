"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Bookmark, Sparkles, Inbox, ArrowRight } from "lucide-react";
import OpportunityCard from "@/components/cards/OpportunityCard";

export default function SavedOpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = async () => {
    try {
      const res = await fetch("/api/bookmarks");
      const data = await res.json();
      if (data.opportunities) {
        setOpportunities(data.opportunities);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleBookmarkToggle = (id: string, isSaved: boolean) => {
    if (!isSaved) {
      setOpportunities((prev) => prev.filter((o) => o.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display font-bold text-xl sm:text-2xl text-white">
          Saved Opportunities
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Quickly access and track deadlines for bookmarked internships and hackathons.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-slate-900 border border-slate-800" />
          ))}
        </div>
      ) : opportunities.length === 0 ? (
        <div className="text-center py-20 rounded-3xl glass-panel border border-slate-800 bg-slate-900/40 p-8 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <Bookmark className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">
            No saved opportunities yet
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Click the bookmark icon on any opportunity card while browsing to save it for later.
          </p>
          <div className="pt-2">
            <Link
              href="/opportunities"
              className="inline-flex items-center space-x-1.5 px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all"
            >
              <span>Explore Opportunities</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {opportunities.map((opp) => (
            <OpportunityCard
              key={opp.id}
              opportunity={opp}
              onBookmarkToggle={handleBookmarkToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}
