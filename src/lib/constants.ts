export interface CategoryMeta {
  name: string;
  slug: string;
  icon: string;
  description: string;
  color: string;
  bgGradient: string;
}

export const CATEGORIES: CategoryMeta[] = [
  {
    name: "Internships",
    slug: "internships",
    icon: "Briefcase",
    description: "Paid and summer internships at top tech companies, startups, and research labs.",
    color: "from-blue-500 to-indigo-600",
    bgGradient: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  {
    name: "Hackathons",
    slug: "hackathons",
    icon: "Code",
    description: "Global online and offline hackathons with massive prize pools and mentorship.",
    color: "from-purple-500 to-pink-600",
    bgGradient: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  },
  {
    name: "Jobs",
    slug: "jobs",
    icon: "Building2",
    description: "Entry-level, graduate, and early-career software engineering and product roles.",
    color: "from-emerald-500 to-teal-600",
    bgGradient: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  {
    name: "Events",
    slug: "events",
    icon: "Calendar",
    description: "Tech meetups, developer summits, product launches, and community gatherings.",
    color: "from-amber-500 to-orange-600",
    bgGradient: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  {
    name: "Competitions",
    slug: "competitions",
    icon: "Trophy",
    description: "Coding contests, algorithmic challenges, case competitions, and design sprints.",
    color: "from-yellow-500 to-amber-600",
    bgGradient: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  },
  {
    name: "Scholarships",
    slug: "scholarships",
    icon: "GraduationCap",
    description: "Merit and need-based tech scholarships, grants, and education sponsorships.",
    color: "from-cyan-500 to-blue-600",
    bgGradient: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  },
  {
    name: "Workshops",
    slug: "workshops",
    icon: "Sparkles",
    description: "Hands-on masterclasses in AI/ML, Web3, Cloud Architecture, and DevOps.",
    color: "from-violet-500 to-indigo-500",
    bgGradient: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  },
  {
    name: "Courses",
    slug: "courses",
    icon: "BookOpen",
    description: "Free and certified technical courses curated by industry leaders.",
    color: "from-sky-500 to-indigo-600",
    bgGradient: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  },
  {
    name: "Fellowships",
    slug: "fellowships",
    icon: "Award",
    description: "Prestigious tech fellowships, open-source cohorts, and venture builder programs.",
    color: "from-rose-500 to-pink-600",
    bgGradient: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  },
  {
    name: "Conferences",
    slug: "conferences",
    icon: "Mic2",
    description: "International engineering conferences, academic symposia, and keynotes.",
    color: "from-fuchsia-500 to-purple-600",
    bgGradient: "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20",
  },
  {
    name: "Webinars",
    slug: "webinars",
    icon: "Video",
    description: "Live interactive tech sessions with founders, engineers, and researchers.",
    color: "from-teal-500 to-emerald-600",
    bgGradient: "bg-teal-500/10 text-teal-400 border-teal-500/20",
  },
  {
    name: "Volunteering",
    slug: "volunteering",
    icon: "HeartHandshake",
    description: "Community initiatives, open-source advocacy, and student club mentorships.",
    color: "from-red-500 to-rose-600",
    bgGradient: "bg-red-500/10 text-red-400 border-red-500/20",
  },
  {
    name: "Campus Opportunities",
    slug: "campus-opportunities",
    icon: "School",
    description: "Campus ambassador programs, student lead initiatives, and university chapters.",
    color: "from-indigo-500 to-blue-600",
    bgGradient: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  },
  {
    name: "Other",
    slug: "other",
    icon: "Compass",
    description: "Accelerators, incubator programs, product grants, and diverse opportunities.",
    color: "from-slate-500 to-gray-600",
    bgGradient: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  },
];

export const WORK_MODES = [
  { label: "Remote", value: "REMOTE" },
  { label: "Hybrid", value: "HYBRID" },
  { label: "On-site", value: "ONSITE" },
];

export const SORT_OPTIONS = [
  { label: "Latest First", value: "latest" },
  { label: "Closing Soonest", value: "deadline" },
  { label: "Most Popular", value: "popular" },
  { label: "Featured First", value: "featured" },
];
