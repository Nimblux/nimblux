export interface PrizeItem {
  id?: string;
  name: string;
  type: string; // "1ST" | "2ND" | "3RD" | "TRACK" | "SPECIAL" | "SPONSOR"
  amount?: string;
  currency?: string;
  description?: string;
  winnerCount?: number;
  sponsor?: string;
  physicalReward?: string;
  certificateIncluded?: boolean;
  additionalBenefits?: string;
}

export function formatCurrency(
  amount: number | string | null | undefined,
  currency: string = "INR"
): string {
  if (amount === null || amount === undefined || amount === "") return "";
  
  const num = typeof amount === "string" ? parseFloat(amount.replace(/,/g, "")) : amount;
  if (isNaN(num)) return String(amount);

  const symbolMap: Record<string, string> = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
  };

  const symbol = symbolMap[currency?.toUpperCase()] || `${currency} `;

  try {
    const formattedNum = new Intl.NumberFormat(
      currency?.toUpperCase() === "INR" ? "en-IN" : "en-US",
      { maximumFractionDigits: 0 }
    ).format(num);
    return `${symbol}${formattedNum}`;
  } catch {
    return `${symbol}${num}`;
  }
}

export function calculateTotalPrizePool(prizes: { amount?: string | number }[]): number {
  if (!Array.isArray(prizes)) return 0;
  return prizes.reduce((acc, p) => {
    if (!p.amount) return acc;
    const val = typeof p.amount === "string" ? parseFloat(p.amount.replace(/,/g, "")) : p.amount;
    return isNaN(val) ? acc : acc + val;
  }, 0);
}

export function getHackathonStatusBadge(status: string): {
  label: string;
  className: string;
  dotColor: string;
} {
  switch (status?.toUpperCase()) {
    case "PUBLISHED":
    case "APPROVED":
      return {
        label: "Live & Active",
        className: "bg-forest-500/10 text-forest-300 border border-forest-500/20",
        dotColor: "bg-forest-400",
      };
    case "PENDING":
      return {
        label: "Pending Review",
        className: "bg-bronze-500/10 text-bronze-300 border border-bronze-500/20",
        dotColor: "bg-bronze-400",
      };
    case "DRAFT":
      return {
        label: "Draft",
        className: "bg-stone-500/10 text-stone-300 border border-stone-500/20",
        dotColor: "bg-stone-400",
      };
    case "PAUSED":
      return {
        label: "Registration Paused",
        className: "bg-amber-500/10 text-amber-300 border border-amber-500/20",
        dotColor: "bg-amber-400",
      };
    case "COMPLETED":
      return {
        label: "Concluded",
        className: "bg-sage-500/10 text-sage-300 border border-sage-500/20",
        dotColor: "bg-sage-400",
      };
    case "REJECTED":
      return {
        label: "Revision Required",
        className: "bg-rose-500/10 text-rose-300 border border-rose-500/20",
        dotColor: "bg-rose-400",
      };
    default:
      return {
        label: status || "Unknown",
        className: "bg-stone-500/10 text-stone-300 border border-stone-500/20",
        dotColor: "bg-stone-400",
      };
  }
}

export function getParticipationModeBadge(mode: string): {
  label: string;
  className: string;
} {
  switch (mode?.toUpperCase()) {
    case "ONLINE":
      return {
        label: "Online / Virtual",
        className: "bg-forest-500/10 text-forest-300 border border-forest-500/20",
      };
    case "OFFLINE":
      return {
        label: "In-Person / Onsite",
        className: "bg-amber-500/10 text-amber-300 border border-amber-500/20",
      };
    case "HYBRID":
    default:
      return {
        label: "Hybrid",
        className: "bg-sage-500/10 text-sage-300 border border-sage-500/20",
      };
  }
}

export function getSubmissionStatusBadge(status: string): {
  label: string;
  className: string;
} {
  switch (status?.toUpperCase()) {
    case "WINNER":
      return {
        label: "Winner 🏆",
        className: "bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold",
      };
    case "JUDGED":
      return {
        label: "Evaluated ✅",
        className: "bg-forest-500/15 text-forest-300 border border-forest-500/30",
      };
    case "UNDER_REVIEW":
      return {
        label: "In Judging ⏳",
        className: "bg-bronze-500/15 text-bronze-300 border border-bronze-500/30",
      };
    case "SUBMITTED":
      return {
        label: "Project Submitted ✅",
        className: "bg-sage-500/15 text-sage-300 border border-sage-500/30",
      };
    case "DRAFT":
    default:
      return {
        label: "Draft",
        className: "bg-stone-500/15 text-stone-300 border border-stone-500/30",
      };
  }
}

export function generateTeamCode(teamName: string = "TEAM"): string {
  const prefix = teamName.replace(/[^A-Za-z0-9]/g, "").slice(0, 3).toUpperCase() || "TM";
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${randomStr}`;
}

export function generateCertificateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "NMB-";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
