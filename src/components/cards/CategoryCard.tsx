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
      className="group relative p-5 rounded-2xl bg-charcoal-card border border-charcoal-cardBorder hover:border-bronze-500/30 hover:bg-charcoal-hover flex flex-col justify-between transition-all duration-200 overflow-hidden shadow-card"
    >
      {/* Subtle Fog Glow on hover */}
      <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-bronze-500/5 group-hover:bg-bronze-500/10 blur-xl transition-all duration-300 pointer-events-none" />

      <div>
        {/* Category Icon & Count */}
        <div className="flex items-center justify-between mb-3.5">
          <div className="w-10 h-10 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder flex items-center justify-center text-ivory-300 group-hover:text-bronze-300 group-hover:border-bronze-500/30 transition-colors">
            <IconComponent className="w-4.5 h-4.5 stroke-[1.8]" />
          </div>

          <span className="text-[10.5px] font-mono text-ivory-500 bg-charcoal-900 px-2.5 py-0.5 rounded-full border border-charcoal-cardBorder">
            {count > 0 ? `${count} active` : "Browse"}
          </span>
        </div>

        {/* Title & Description */}
        <h3 className="font-sans font-bold text-[15px] text-ivory-100 group-hover:text-bronze-300 transition-colors">
          {category.name}
        </h3>
        <p className="mt-1 text-xs text-ivory-500 line-clamp-2 leading-relaxed">
          {category.description}
        </p>
      </div>

      {/* Explore Action */}
      <div className="mt-4 pt-3 border-t border-charcoal-cardBorder flex items-center justify-between text-xs font-semibold text-bronze-400 group-hover:text-bronze-300">
        <span>Explore</span>
        <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
}
