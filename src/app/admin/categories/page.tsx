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
        <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
          <Grid className="w-4 h-4" />
          <span>Category Taxonomies</span>
        </div>
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
          Manage Opportunity Categories ({categories.length})
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Configured category routes, descriptions, and real-time active listing counts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full p-8 text-center text-slate-400 text-xs animate-pulse">
            Loading categories...
          </div>
        ) : (
          categories.map((cat) => (
            <div
              key={cat.id}
              className="p-5 rounded-2xl glass-panel border border-slate-800 bg-slate-900/40 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-white">{cat.name}</span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {cat.activeCount || 0} active
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {cat.description}
                </p>
                <div className="mt-2 text-[11px] font-mono text-slate-500">
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
