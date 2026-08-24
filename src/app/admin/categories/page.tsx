"use client";

import React, { useEffect, useState } from "react";
import { Grid, PlusCircle, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      if (data.categories) setCategories(data.categories);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center space-x-2 text-bronze-400 text-xs font-mono font-bold uppercase tracking-wider mb-1">
          <Grid className="w-4 h-4" />
          <span>Category Taxonomies</span>
        </div>
        <h1 className="font-serif-heading font-medium text-2xl sm:text-3xl text-ivory-100">
          Opportunity Categories ({categories.length})
        </h1>
        <p className="text-xs text-ivory-500 mt-0.5">
          Configured category routes, descriptions, and real-time active listing counts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full p-8 text-center text-ivory-500 text-xs animate-pulse font-mono">
            Loading categories...
          </div>
        ) : (
          categories.map((cat) => (
            <div
              key={cat.id}
              className="p-5 rounded-2xl bg-charcoal-card border border-charcoal-cardBorder flex flex-col justify-between space-y-3 shadow-card"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-ivory-100">{cat.name}</span>
                  <span className="text-[10.5px] font-bold font-mono px-2 py-0.5 rounded-md bg-bronze-500/10 text-bronze-300 border border-bronze-500/20">
                    {cat.activeCount || 0} active
                  </span>
                </div>
                <p className="text-xs text-ivory-400 leading-relaxed">
                  {cat.description}
                </p>
                <div className="mt-2 text-[10.5px] font-mono text-ivory-500">
                  Route: /{cat.slug}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
