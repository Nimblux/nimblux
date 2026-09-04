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
      className="group relative p-5 rounded-[15px] bg-[#111615] border border-white/[0.08] hover:border-white/[0.18] hover:bg-[#151A18] hover:-translate-y-1 flex flex-col justify-between transition-all duration-200 shadow-soft"
    >
      <div>
        {/* Category Icon & Count */}
        <div className="flex items-center justify-between mb-3.5">
          <div className="w-10 h-10 rounded-[10px] bg-[#0E1110] border border-white/[0.08] flex items-center justify-center text-[#F5F1E8] group-hover:text-[#D8B77A] group-hover:border-[#D8B77A]/30 transition-colors">
            <IconComponent className="w-4.5 h-4.5 stroke-[1.8]" />
          </div>

          <span className="text-[11px] font-mono text-[#A9AAA5] bg-[#0E1110] px-2.5 py-0.5 rounded-[6px] border border-white/[0.06]">
            {count > 0 ? `${count} open` : "Explore"}
          </span>
        </div>

        {/* Title & Description */}
        <h3 className="font-semibold text-[15px] text-[#F5F1E8] group-hover:text-[#D8B77A] transition-colors">
          {category.name}
        </h3>
        <p className="mt-1 text-xs text-[#A9AAA5] line-clamp-2 leading-relaxed">
          {category.description}
        </p>
      </div>

      {/* Explore Action with Arrow */}
      <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-medium text-[#D8B77A]">
        <span>Explore Track</span>
        <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
}
