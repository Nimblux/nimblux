import React from "react";
import { Calendar, MapPin, ExternalLink, Sparkles, Clock } from "lucide-react";
import { formatDate, getWorkModeBadge } from "@/lib/utils";

export interface EventCardData {
  id: string;
  title: string;
  slug: string;
  description: string;
  banner?: string | null;
  eventDate: string | Date;
  location: string;
  mode: string;
  registrationUrl: string;
  organizer: string;
  isFeatured?: boolean;
}

interface EventCardProps {
  event: EventCardData;
}

export default function EventCard({ event }: EventCardProps) {
  const modeBadge = getWorkModeBadge(event.mode);
  const formattedDate = formatDate(event.eventDate);

  return (
    <div className="group relative rounded-2xl glass-panel glass-panel-hover overflow-hidden border border-slate-800 bg-slate-900/40 hover:border-slate-700 flex flex-col justify-between transition-all duration-300">
      {/* Event Banner */}
      <div className="relative h-44 w-full bg-slate-800 overflow-hidden">
        {event.banner ? (
          <img
            src={event.banner}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-indigo-950 via-slate-900 to-cyan-950 flex items-center justify-center">
            <Calendar className="w-12 h-12 text-indigo-400/40" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

        {/* Date Pill overlay */}
        <div className="absolute bottom-3 left-4 flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-slate-900/90 backdrop-blur-md border border-slate-700/80 text-xs font-semibold text-indigo-300">
          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
          <span>{formattedDate}</span>
        </div>

        {event.isFeatured && (
          <div className="absolute top-3 right-3 flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 backdrop-blur-md border border-amber-500/30 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3" />
            <span>Featured</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1 justify-between">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-400 mb-2">
            <span className="font-semibold text-slate-300">{event.organizer}</span>
            <span>•</span>
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${modeBadge.className}`}>
              {modeBadge.label}
            </span>
          </div>

          <h3 className="font-display font-bold text-base text-white group-hover:text-indigo-300 transition-colors line-clamp-2">
            {event.title}
          </h3>

          <p className="mt-2 text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {event.description}
          </p>
        </div>

        {/* Location & Register CTA */}
        <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1 text-slate-400 truncate max-w-[170px]">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-slate-500" />
            <span className="truncate">{event.location}</span>
          </div>

          <a
            href={event.registrationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1 px-3.5 py-1.5 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm shadow-indigo-600/30 transition-all"
          >
            <span>Register</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
