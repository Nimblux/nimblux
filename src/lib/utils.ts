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
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/&/g, "-and-") // Replace & with 'and'
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-"); // Replace multiple - with single -
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
    return { days, text: "Deadline passed", isUrgent: false, isExpired: true };
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
  return { days, text: `${days} days left`, isUrgent: false, isExpired: false };
}

export function getWorkModeBadge(mode: string): {
  label: string;
  className: string;
} {
  switch (mode?.toUpperCase()) {
    case "REMOTE":
      return {
        label: "Remote",
        className: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
      };
    case "HYBRID":
      return {
        label: "Hybrid",
        className: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20",
      };
    case "ONSITE":
    default:
      return {
        label: "On-site",
        className: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
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
        className: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
        dotColor: "bg-emerald-400",
      };
    case "REJECTED":
      return {
        label: "Rejected / Revision",
        className: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
        dotColor: "bg-rose-400",
      };
    case "PENDING":
    default:
      return {
        label: "Pending Review",
        className: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
        dotColor: "bg-amber-400",
      };
  }
}
