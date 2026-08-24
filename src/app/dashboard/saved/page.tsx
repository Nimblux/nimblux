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
        <h2 className="font-serif-heading font-medium text-xl sm:text-2xl text-ivory-100">
          Saved Opportunities
        </h2>
        <p className="text-xs text-ivory-500 mt-0.5">
          Quickly access and track application closing dates for bookmarked opportunities.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-charcoal-card border border-charcoal-cardBorder" />
          ))}
        </div>
      ) : opportunities.length === 0 ? (
        <div className="text-center py-20 rounded-3xl bg-charcoal-card border border-charcoal-cardBorder p-8 space-y-3 shadow-card">
          <div className="w-14 h-14 rounded-2xl bg-charcoal-900 border border-charcoal-cardBorder flex items-center justify-center mx-auto text-ivory-500">
            <Bookmark className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-ivory-100">
            No saved opportunities yet
          </h3>
          <p className="text-xs text-ivory-500 max-w-sm mx-auto leading-relaxed">
            Click the bookmark icon on any opportunity card while browsing to save it to this collection.
          </p>
          <div className="pt-2">
            <Link
              href="/opportunities"
              className="inline-flex items-center space-x-1.5 px-6 py-2.5 rounded-xl font-bold text-xs text-charcoal-950 bg-bronze-500 hover:bg-bronze-400 shadow-button transition-all"
            >
              <span>Explore Opportunities</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
