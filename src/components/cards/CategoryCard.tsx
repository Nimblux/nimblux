import React from "react";
import Link from "next/link";
import {
  Briefcase,
  Code,
  Building2,
  Calendar,
  Trophy,
  GraduationCap,
  Sparkles,
  BookOpen,
  Award,
  Mic2,
  Video,
  HeartHandshake,
  School,
  Compass,
  ArrowRight,
} from "lucide-react";
import { CategoryMeta } from "@/lib/constants";

interface CategoryCardProps {
  category: CategoryMeta;
  count?: number;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Briefcase,
  Code,
  Building2,
  Calendar,
  Trophy,
  GraduationCap,
  Sparkles,
  BookOpen,
  Award,
  Mic2,
  Video,
  HeartHandshake,
  School,
  Compass,
};

export default function CategoryCard({ category, count = 0 }: CategoryCardProps) {
  const IconComponent = iconMap[category.icon] || Compass;

  return (
    <Link
      href={`/${category.slug}`}
      className="group relative p-5 rounded-2xl glass-panel glass-panel-hover border border-slate-800/90 bg-slate-900/30 hover:border-slate-700 flex flex-col justify-between transition-all duration-300 overflow-hidden"
    >
      {/* Background Subtle Gradient Glow */}
      <div
        className={`absolute -right-10 -top-10 w-28 h-28 rounded-full bg-gradient-to-br ${category.color} opacity-10 group-hover:opacity-20 blur-xl transition-opacity duration-300`}
      />

      <div>
        {/* Category Icon */}
        <div className="flex items-center justify-between mb-4">
          <div
            className={`w-11 h-11 rounded-xl bg-gradient-to-br ${category.color} p-[1px] shadow-md`}
          >
            <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <IconComponent className="w-5 h-5" />
            </div>
          </div>

          <span className="text-[11px] font-semibold text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700/50">
            {count > 0 ? `${count} active` : "Discover"}
          </span>
        </div>

        {/* Title & Description */}
        <h3 className="font-display font-bold text-base text-white group-hover:text-indigo-300 transition-colors">
          {category.name}
        </h3>
        <p className="mt-1.5 text-xs text-slate-400 line-clamp-2 leading-relaxed">
          {category.description}
        </p>
      </div>

      {/* Explore Link CTA */}
      <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs font-semibold text-indigo-400 group-hover:text-indigo-300">
        <span>Explore Opportunities</span>
        <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
}
