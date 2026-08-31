export interface CategoryMeta {
  name: string;
  slug: string;
  icon: string;
  description: string;
  color: string;
  bgGradient: string;
  dotColor: string;
}

export const CATEGORIES: CategoryMeta[] = [
  {
    name: "Internships",
    slug: "internships",
    icon: "Briefcase",
    description: "Paid and summer internships at top tech companies, startups, and research labs.",
    color: "from-bronze-400 to-bronze-600",
    bgGradient: "bg-bronze-500/10 text-bronze-300 border-bronze-500/20",
    dotColor: "bg-bronze-400",
  },
  {
    name: "Hackathons",
    slug: "hackathons",
    icon: "Code",
    description: "Global online and offline hackathons with mentorship, builder networks, and prize pools.",
    color: "from-forest-400 to-forest-600",
    bgGradient: "bg-forest-500/10 text-forest-300 border-forest-500/20",
    dotColor: "bg-forest-400",
  },
  {
    name: "Jobs",
    slug: "jobs",
    icon: "Building2",
    description: "Entry-level, graduate, and early-career software engineering, design, and product roles.",
    color: "from-sage-400 to-sage-600",
    bgGradient: "bg-sage-500/10 text-sage-300 border-sage-500/20",
    dotColor: "bg-sage-400",
  },
  {
    name: "Events",
    slug: "events",
    icon: "Calendar",
    description: "Developer summits, tech keynotes, founder fireside chats, and community gatherings.",
    color: "from-amber-400 to-amber-600",
    bgGradient: "bg-amber-500/10 text-amber-300 border-amber-500/20",
    dotColor: "bg-amber-400",
  },
  {
    name: "Competitions",
    slug: "competitions",
    icon: "Trophy",
    description: "Coding contests, algorithmic challenges, case competitions, and design sprints.",
    color: "from-yellow-400 to-amber-600",
    bgGradient: "bg-yellow-500/10 text-yellow-300 border-yellow-500/20",
    dotColor: "bg-yellow-400",
  },
  {
    name: "Scholarships",
    slug: "scholarships",
    icon: "GraduationCap",
    description: "Merit and need-based tech scholarships, grants, and education sponsorships.",
    color: "from-emerald-400 to-teal-600",
    bgGradient: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    dotColor: "bg-emerald-400",
  },
  {
    name: "Workshops",
    slug: "workshops",
    icon: "Sparkles",
    description: "Hands-on masterclasses in AI/ML, Systems Engineering, Cloud, and Product.",
    color: "from-bronze-300 to-amber-500",
    bgGradient: "bg-amber-500/10 text-amber-200 border-amber-500/20",
    dotColor: "bg-amber-300",
  },
  {
    name: "Courses",
    slug: "courses",
    icon: "BookOpen",
    description: "Free and certified technical courses curated by industry-leading universities and labs.",
    color: "from-stone-300 to-stone-500",
    bgGradient: "bg-stone-500/10 text-stone-300 border-stone-500/20",
    dotColor: "bg-stone-400",
  },
  {
    name: "Fellowships",
    slug: "fellowships",
    icon: "Award",
    description: "Prestigious tech fellowships, open-source cohorts, and venture builder programs.",
    color: "from-forest-300 to-emerald-600",
    bgGradient: "bg-forest-500/10 text-forest-200 border-forest-500/20",
    dotColor: "bg-forest-400",
  },
  {
    name: "Conferences",
    slug: "conferences",
    icon: "Mic2",
    description: "International engineering conferences, academic symposia, and research keynotes.",
    color: "from-taupe-400 to-taupe-600",
    bgGradient: "bg-taupe-500/10 text-taupe-300 border-taupe-500/20",
    dotColor: "bg-taupe-400",
  },
  {
    name: "Webinars",
    slug: "webinars",
    icon: "Video",
    description: "Live interactive tech sessions with founders, principal engineers, and researchers.",
    color: "from-teal-400 to-forest-500",
    bgGradient: "bg-teal-500/10 text-teal-300 border-teal-500/20",
    dotColor: "bg-teal-400",
  },
  {
    name: "Volunteering",
    slug: "volunteering",
    icon: "HeartHandshake",
    description: "Community initiatives, open-source maintainership, and student mentorship.",
    color: "from-rose-400 to-orange-500",
    bgGradient: "bg-rose-500/10 text-rose-300 border-rose-500/20",
    dotColor: "bg-rose-400",
  },
  {
    name: "Campus Opportunities",
    slug: "campus-opportunities",
    icon: "School",
    description: "Campus ambassador programs, student lead initiatives, and university chapters.",
    color: "from-bronze-400 to-stone-500",
    bgGradient: "bg-bronze-500/10 text-bronze-200 border-bronze-500/20",
    dotColor: "bg-bronze-300",
  },
  {
    name: "Other",
    slug: "other",
    icon: "Compass",
    description: "Accelerators, incubator programs, product grants, and diverse opportunities.",
    color: "from-stone-400 to-zinc-600",
    bgGradient: "bg-stone-500/10 text-stone-300 border-stone-500/20",
    dotColor: "bg-stone-400",
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

export interface OpportunityTypeMeta {
  type: string;
  name: string;
  categorySlug: string;
  description: string;
  icon: string;
  modeLabel: "application" | "registration";
}

export const OPPORTUNITY_TYPES: OpportunityTypeMeta[] = [
  {
    type: "INTERNSHIP",
    name: "Internship",
    categorySlug: "internships",
    description: "Paid and summer internships, co-ops, and research student positions",
    icon: "Briefcase",
    modeLabel: "application",
  },
  {
    type: "JOB",
    name: "Full-Time Job",
    categorySlug: "jobs",
    description: "New grad, junior, and early career software & tech roles",
    icon: "Building2",
    modeLabel: "application",
  },
  {
    type: "HACKATHON",
    name: "Hackathon",
    categorySlug: "hackathons",
    description: "Sprint buildathons, virtual/onsite hackathons with teams & prizes",
    icon: "Code",
    modeLabel: "registration",
  },
  {
    type: "WORKSHOP",
    name: "Workshop",
    categorySlug: "workshops",
    description: "Hands-on technical masterclasses, live coding labs, and training",
    icon: "Sparkles",
    modeLabel: "registration",
  },
  {
    type: "COMPETITION",
    name: "Competition",
    categorySlug: "competitions",
    description: "Coding contests, algorithmic battles, design sprints, & case challenges",
    icon: "Trophy",
    modeLabel: "registration",
  },
  {
    type: "EVENT",
    name: "Event / Meetup",
    categorySlug: "events",
    description: "Developer keynotes, community gatherings, tech meetups",
    icon: "Calendar",
    modeLabel: "registration",
  },
  {
    type: "SCHOLARSHIP",
    name: "Scholarship",
    categorySlug: "scholarships",
    description: "Merit and need-based education grants, sponsorships, and tuition aid",
    icon: "GraduationCap",
    modeLabel: "application",
  },
  {
    type: "FELLOWSHIP",
    name: "Fellowship",
    categorySlug: "fellowships",
    description: "Elite developer cohorts, open-source cohorts, and venture fellowships",
    icon: "Award",
    modeLabel: "application",
  },
  {
    type: "COURSE",
    name: "Course",
    categorySlug: "courses",
    description: "Structured technical learning paths, curricula, and certifications",
    icon: "BookOpen",
    modeLabel: "registration",
  },
  {
    type: "BOOTCAMP",
    name: "Bootcamp",
    categorySlug: "courses",
    description: "Intensive multi-week cohorts and career accelerator programs",
    icon: "Layers",
    modeLabel: "registration",
  },
  {
    type: "WEBINAR",
    name: "Webinar",
    categorySlug: "webinars",
    description: "Live interactive tech sessions, AMAs, and expert panel talks",
    icon: "Video",
    modeLabel: "registration",
  },
  {
    type: "CONFERENCE",
    name: "Conference",
    categorySlug: "conferences",
    description: "International engineering summits, research symposia, and tech talks",
    icon: "Mic2",
    modeLabel: "registration",
  },
  {
    type: "CHALLENGE",
    name: "Challenge",
    categorySlug: "competitions",
    description: "Open innovation challenges, bug bounties, and problem-solving contests",
    icon: "Zap",
    modeLabel: "registration",
  },
  {
    type: "VOLUNTEERING",
    name: "Volunteering",
    categorySlug: "volunteering",
    description: "Open-source maintainership, mentor programs, and community initiatives",
    icon: "HeartHandshake",
    modeLabel: "application",
  },
  {
    type: "CAMPUS",
    name: "Campus Opportunity",
    categorySlug: "campus-opportunities",
    description: "Campus ambassador, student lead initiatives, and university chapters",
    icon: "School",
    modeLabel: "application",
  },
  {
    type: "OTHER",
    name: "Other Opportunity",
    categorySlug: "other",
    description: "Startup grants, venture cohorts, accelerators, and diverse programs",
    icon: "Compass",
    modeLabel: "application",
  },
];

export const APPLICATION_STAGES = [
  { key: "SUBMITTED", label: "Applied", description: "Application received and submitted" },
  { key: "UNDER_REVIEW", label: "Under Review", description: "Organizer is reviewing your profile" },
  { key: "SHORTLISTED", label: "Shortlisted", description: "Shortlisted for next evaluation" },
  { key: "INTERVIEW", label: "Interview", description: "Interview / discussion round" },
  { key: "SELECTED", label: "Selected", description: "Offered / Selected for position" },
  { key: "REJECTED", label: "Not Selected", description: "Application did not move forward" },
];

export const SOCIAL_LINKS = {
  github: "https://github.com/Nimblux",
  linkedin: "https://www.linkedin.com/company/nimblux",
  twitter: "https://x.com/joinimblux",
  instagram: "https://www.instagram.com/joinnimblux/",
  whatsappGroup: "https://chat.whatsapp.com/FEmomRwaYYw2SJvbzN0uPa?s=cl&p=a&ilr=1",
};


