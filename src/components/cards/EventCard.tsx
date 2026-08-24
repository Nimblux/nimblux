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
    <article className="group relative rounded-2xl bg-charcoal-card border border-charcoal-cardBorder hover:border-bronze-500/30 hover:shadow-card-hover flex flex-col justify-between transition-all duration-200 overflow-hidden shadow-card">
      {/* Event Banner */}
      <div className="relative h-44 w-full bg-charcoal-900 overflow-hidden">
        {event.banner ? (
          <img
            src={event.banner}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-charcoal-850 flex items-center justify-center">
            <Calendar className="w-10 h-10 text-ivory-500/40" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-charcoal-950/40 to-transparent" />

        {/* Date Pill overlay */}
        <div className="absolute bottom-3 left-4 flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-charcoal-950/90 backdrop-blur-md border border-charcoal-cardBorder text-xs font-mono font-medium text-bronze-300">
          <Calendar className="w-3.5 h-3.5 text-bronze-400" />
          <span>{formattedDate}</span>
        </div>

        {event.isFeatured && (
          <div className="absolute top-3 right-3 flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-bronze-500/20 backdrop-blur-md border border-bronze-500/30 text-bronze-300 text-[10px] font-mono font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3" />
            <span>Featured</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1 justify-between">
        <div>
          <div className="flex items-center space-x-2 text-xs text-ivory-500 mb-2">
            <span className="font-semibold text-ivory-300">{event.organizer}</span>
            <span>•</span>
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${modeBadge.className}`}>
              {modeBadge.label}
            </span>
          </div>

          <h3 className="font-sans font-bold text-base text-ivory-100 group-hover:text-bronze-300 transition-colors line-clamp-2">
            {event.title}
          </h3>

          <p className="mt-2 text-xs text-ivory-500 line-clamp-2 leading-relaxed">
            {event.description}
          </p>
        </div>

        {/* Location & Register CTA */}
        <div className="mt-5 pt-3.5 border-t border-charcoal-cardBorder flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1 text-ivory-400 truncate max-w-[170px]">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-ivory-500" />
            <span className="truncate">{event.location}</span>
          </div>

          <a
            href={event.registrationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1 px-3.5 py-1.5 rounded-xl font-bold text-xs text-charcoal-950 bg-bronze-500 hover:bg-bronze-400 shadow-button transition-all"
          >
            <span>Register</span>
            <ExternalLink className="w-3 h-3 ml-0.5" />
          </a>
        </div>
      </div>
    </article>
  );
}
