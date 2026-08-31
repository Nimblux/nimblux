import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/&/g, "-and-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "N/A";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "N/A";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

export function getDaysRemaining(date: string | Date | null | undefined): {
  days: number;
  text: string;
  isUrgent: boolean;
  isExpired: boolean;
} {
  if (!date) {
    return { days: 0, text: "No deadline", isUrgent: false, isExpired: false };
  }
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (days < 0) {
    return { days, text: "Closed", isUrgent: false, isExpired: true };
  }
  if (days === 0) {
    return { days: 0, text: "Closes today", isUrgent: true, isExpired: false };
  }
  if (days === 1) {
    return { days: 1, text: "1 day left", isUrgent: true, isExpired: false };
  }
  if (days <= 3) {
    return { days, text: `${days} days left`, isUrgent: true, isExpired: false };
  }
  return { days, text: `${days}d remaining`, isUrgent: false, isExpired: false };
}

export function getWorkModeBadge(mode: string): {
  label: string;
  className: string;
} {
  switch (mode?.toUpperCase()) {
    case "REMOTE":
      return {
        label: "Remote",
        className: "bg-forest-500/10 text-forest-300 border border-forest-500/20",
      };
    case "HYBRID":
      return {
        label: "Hybrid",
        className: "bg-sage-500/10 text-sage-300 border border-sage-500/20",
      };
    case "ONSITE":
    default:
      return {
        label: "On-site",
        className: "bg-stone-500/10 text-stone-300 border border-stone-500/20",
      };
  }
}

export function getStatusBadge(status: string): {
  label: string;
  className: string;
  dotColor: string;
} {
  switch (status?.toUpperCase()) {
    case "APPROVED":
      return {
        label: "Published",
        className: "bg-forest-500/10 text-forest-300 border border-forest-500/20",
        dotColor: "bg-forest-400",
      };
    case "REJECTED":
      return {
        label: "Revision Requested",
        className: "bg-rose-500/10 text-rose-300 border border-rose-500/20",
        dotColor: "bg-rose-400",
      };
    case "PENDING":
    default:
      return {
        label: "Under Review",
        className: "bg-bronze-500/10 text-bronze-300 border border-bronze-500/20",
        dotColor: "bg-bronze-400",
      };
  }
}

export function getApplicationStageBadge(stage: string): {
  label: string;
  className: string;
  dotColor: string;
} {
  switch (stage?.toUpperCase()) {
    case "SELECTED":
      return {
        label: "Selected / Offered",
        className: "bg-forest-500/20 text-forest-300 border border-forest-500/40",
        dotColor: "bg-forest-400",
      };
    case "INTERVIEW":
      return {
        label: "Interview",
        className: "bg-amber-500/20 text-amber-300 border border-amber-500/40",
        dotColor: "bg-amber-400",
      };
    case "SHORTLISTED":
      return {
        label: "Shortlisted",
        className: "bg-sage-500/20 text-sage-300 border border-sage-500/40",
        dotColor: "bg-sage-400",
      };
    case "UNDER_REVIEW":
      return {
        label: "Under Review",
        className: "bg-bronze-500/20 text-bronze-300 border border-bronze-500/40",
        dotColor: "bg-bronze-400",
      };
    case "REJECTED":
      return {
        label: "Not Selected",
        className: "bg-rose-500/20 text-rose-300 border border-rose-500/40",
        dotColor: "bg-rose-400",
      };
    case "SUBMITTED":
    default:
      return {
        label: "Applied",
        className: "bg-charcoal-800 text-ivory-300 border border-charcoal-700",
        dotColor: "bg-ivory-400",
      };
  }
}

export function getRegistrationStatusBadge(status: string): {
  label: string;
  className: string;
  dotColor: string;
} {
  switch (status?.toUpperCase()) {
    case "ATTENDED":
      return {
        label: "Attended",
        className: "bg-forest-500/20 text-forest-300 border border-forest-500/40",
        dotColor: "bg-forest-400",
      };
    case "CANCELLED":
      return {
        label: "Cancelled",
        className: "bg-rose-500/20 text-rose-300 border border-rose-500/40",
        dotColor: "bg-rose-400",
      };
    case "WAITLIST":
      return {
        label: "Waitlisted",
        className: "bg-amber-500/20 text-amber-300 border border-amber-500/40",
        dotColor: "bg-amber-400",
      };
    case "REGISTERED":
    default:
      return {
        label: "Confirmed",
        className: "bg-forest-500/15 text-forest-300 border border-forest-500/30",
        dotColor: "bg-forest-400",
      };
  }
}

