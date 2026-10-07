"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  Trophy,
  Users,
  Code,
  FileText,
  DollarSign,
  Plus,
  Trash2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Info,
  ShieldCheck,
  Save,
  Globe,
  Layers,
} from "lucide-react";
import { calculateTotalPrizePool, formatCurrency } from "@/lib/hackathon";
import ImageUpload from "@/components/common/ImageUpload";

export default function OrganizeHackathonPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Step 1: Basic Info
  const [basicInfo, setBasicInfo] = useState({
    title: "",
    tagline: "",
    shortDescription: "",
    description: "",
    coverImage: "",
    logo: "",
    organizerName: "",
    organizerLogo: "",
    organizerDescription: "",
    contactEmail: "",
    contactPhone: "",
    websiteUrl: "",
    discordUrl: "",
  });

  // Step 2: Schedule
  const [schedule, setSchedule] = useState({
    regStartDate: new Date().toISOString().split("T")[0],
    regEndDate: "",
    startDate: "",
    endDate: "",
    submissionDeadline: "",
    judgingStartDate: "",
    judgingEndDate: "",
    winnersAnnouncedDate: "",
  });

  // Step 3: Participation & Mode
  const [participation, setParticipation] = useState({
    mode: "ONLINE",
    location: "Online / Virtual",
    eligibility: "Open to all students, developers, and builders worldwide.",
    collegeRestrictions: "",
    countryRestrictions: "",
    experienceLevel: "ALL",
    allowIndividual: true,
    allowTeam: true,
    minTeamSize: 1,
    maxTeamSize: 4,
    isExternalRegistration: false,
    externalRegistrationUrl: "",
    registrationFee: "Free",
  });

  // Step 4: Rules & Tracks & Judging Criteria
  const [tracks, setTracks] = useState<Array<{ name: string; description: string; problemStatement: string; prize: string }>>([
    { name: "Open Innovation", description: "Build any creative software or hardware application.", problemStatement: "", prize: "" },
  ]);

  const [rulesData, setRulesData] = useState({
    rules: "1. All code and prototypes must be developed during the official hackathon window.\n2. Projects using third-party APIs and libraries are permitted with proper attribution.\n3. Be respectful and adhere to the NIMBLUX Code of Conduct.",
    submissionRequirements: "Submit a GitHub repository link, a working demo / deployed URL, and a 2-3 minute video walkthrough.",
    codeOfConduct: "We are committed to providing a friendly, safe and welcoming environment for all participants regardless of gender, sexual orientation, disability, ethnicity, or religion.",
    techAllowed: "Any programming languages, frameworks, AI APIs (OpenAI, Gemini, Anthropic), and developer tools.",
    techProhibited: "Pre-built closed proprietary commercial products or plagiarized submissions.",
  });

  const [criteria, setCriteria] = useState<Array<{ name: string; description: string; maxScore: number; weight: number }>>([
    { name: "Innovation & Creativity", description: "Novelty, uniqueness, and problem-solving creativity", maxScore: 10, weight: 1.0 },
    { name: "Technical Execution", description: "Code quality, architecture, depth of implementation, and stability", maxScore: 10, weight: 1.0 },
    { name: "UI / UX & Polish", description: "User experience design, aesthetics, and overall product polish", maxScore: 10, weight: 1.0 },
    { name: "Impact & Utility", description: "Market potential, real-world usefulness, and scalability", maxScore: 10, weight: 1.0 },
  ]);

  // Step 5: Prize Pool
  const [hasPrizePool, setHasPrizePool] = useState(true);
  const [prizeCurrency, setPrizeCurrency] = useState("INR");
  const [prizes, setPrizes] = useState<Array<{
    name: string;
    type: string;
    amount: string;
    description: string;
    winnerCount: number;
    sponsor: string;
    physicalReward: string;
    certificateIncluded: boolean;
    additionalBenefits: string;
  }>>([
    { name: "1st Prize — Winner", type: "1ST", amount: "50000", description: "Champion team", winnerCount: 1, sponsor: "", physicalReward: "", certificateIncluded: true, additionalBenefits: "VC / Mentorship Fast-track" },
    { name: "2nd Prize — Runner Up", type: "2ND", amount: "30000", description: "Second place team", winnerCount: 1, sponsor: "", physicalReward: "", certificateIncluded: true, additionalBenefits: "" },
    { name: "3rd Prize", type: "3RD", amount: "20000", description: "Third place team", winnerCount: 1, sponsor: "", physicalReward: "", certificateIncluded: true, additionalBenefits: "" },
    { name: "Best AI Innovation", type: "SPECIAL", amount: "10000", description: "Top project leveraging generative AI", winnerCount: 1, sponsor: "", physicalReward: "", certificateIncluded: true, additionalBenefits: "" },
    { name: "Best UI/UX Design", type: "SPECIAL", amount: "5000", description: "Most intuitive user interface", winnerCount: 1, sponsor: "", physicalReward: "", certificateIncluded: true, additionalBenefits: "" },
  ]);

  // Auth verification
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (!data.user) {
          router.push("/login?redirect=/organize-hackathon");
        } else {
          setUser(data.user);
          setBasicInfo((prev) => ({
            ...prev,
            organizerName: prev.organizerName || data.user.organizationName || data.user.name,
            organizerLogo: prev.organizerLogo || data.user.organizationLogo || "",
            organizerDescription: prev.organizerDescription || data.user.organizationBio || "",
            websiteUrl: prev.websiteUrl || data.user.organizationWebsite || "",
            contactEmail: prev.contactEmail || data.user.organizationEmail || data.user.email,
            contactPhone: prev.contactPhone || data.user.organizationPhone || data.user.phone || "",
          }));
        }
      })
      .catch(() => router.push("/login?redirect=/organize-hackathon"))
      .finally(() => setCheckingAuth(false));
  }, [router]);

  const computedTotal = calculateTotalPrizePool(prizes);

  // Track manipulation
  const addTrack = () => {
    setTracks([...tracks, { name: "", description: "", problemStatement: "", prize: "" }]);
  };
  const removeTrack = (index: number) => {
    setTracks(tracks.filter((_, i) => i !== index));
  };
  const updateTrack = (index: number, field: string, value: string) => {
    const updated = [...tracks];
    (updated[index] as any)[field] = value;
    setTracks(updated);
  };

  // Prize manipulation
  const addPrize = () => {
    setPrizes([
      ...prizes,
      {
        name: "",
        type: "SPECIAL",
        amount: "",
        description: "",
        winnerCount: 1,
        sponsor: "",
        physicalReward: "",
        certificateIncluded: true,
        additionalBenefits: "",
      },
    ]);
  };
  const removePrize = (index: number) => {
    setPrizes(prizes.filter((_, i) => i !== index));
  };
  const updatePrize = (index: number, field: string, value: any) => {
    const updated = [...prizes];
    (updated[index] as any)[field] = value;
    setPrizes(updated);
  };

  // Submit Handler (Draft or Submit for Moderation)
  const handleSubmit = async (isDraft: boolean) => {
    setError("");
    setLoading(true);

    if (!basicInfo.title.trim() || !basicInfo.shortDescription.trim() || !basicInfo.organizerName.trim()) {
      setError("Please provide a hackathon title, short description, and organizer name.");
      setLoading(false);
      return;
    }

    if (!schedule.regEndDate || !schedule.startDate || !schedule.endDate || !schedule.submissionDeadline) {
      setError("Please complete all required schedule dates in Step 2.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        ...basicInfo,
        ...schedule,
        ...participation,
        ...rulesData,
        hasPrizePool,
        prizeCurrency,
        totalPrizePool: computedTotal > 0 ? String(computedTotal) : null,
        tracks: tracks.filter((t) => t.name.trim()),
        prizes: hasPrizePool ? prizes.filter((p) => p.name.trim()) : [],
        judgingCriteria: criteria,
        isDraft,
      };

      const res = await fetch("/api/hackathons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create hackathon.");
      }

      setSuccessMessage(
        isDraft
          ? "Hackathon draft saved successfully! Redirecting..."
          : "Hackathon submitted for review! It will be live once approved by NIMBLUX moderators."
      );

      setTimeout(() => {
        router.push(isDraft ? `/organizer/hackathons/${data.hackathon.id}` : "/dashboard/hackathons");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-bronze-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  const steps = [
    { num: 1, label: "Basic Info", icon: FileText },
    { num: 2, label: "Schedule", icon: Calendar },
    { num: 3, label: "Participation", icon: Users },
    { num: 4, label: "Rules & Tracks", icon: Code },
    { num: 5, label: "Prizes & Rewards", icon: Trophy },
  ];

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-bronze-500/10 border border-bronze-500/20 text-bronze-300 text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Hackathon Host Studio</span>
        </div>
        <h1 className="font-serif-heading font-medium text-3xl sm:text-4xl text-ivory-100">
          Organize a Hackathon on NIMBLUX
        </h1>
        <p className="text-xs sm:text-sm text-ivory-400 max-w-lg mx-auto">
          Create, manage participants, form builder teams, conduct judging, and distribute prizes directly in-platform.
        </p>
      </div>

      {/* 5-Step Progress Stepper */}
      <div className="grid grid-cols-5 gap-2 p-3 rounded-2xl bg-charcoal-card border border-charcoal-cardBorder shadow-card">
        {steps.map((step) => {
          const isActive = currentStep === step.num;
          const isDone = currentStep > step.num;
          return (
            <button
              key={step.num}
              onClick={() => setCurrentStep(step.num)}
              className={`p-2.5 rounded-xl flex flex-col items-center justify-center text-center transition-all ${
                isActive
                  ? "bg-bronze-500 text-charcoal-950 font-bold shadow-button"
                  : isDone
                  ? "bg-charcoal-900 text-forest-300 border border-forest-500/30"
                  : "text-ivory-500 hover:text-ivory-300"
              }`}
            >
              <step.icon className="w-4 h-4 mb-1" />
              <span className="text-[10px] font-mono font-semibold hidden sm:inline-block">
                {step.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Form Container */}
      <div className="p-6 sm:p-10 rounded-3xl bg-charcoal-card border border-charcoal-cardBorder shadow-card space-y-8">
        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
            <Info className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage ? (
          <div className="text-center py-12 space-y-4">
            <div className="w-16 h-16 rounded-full bg-forest-500/20 text-forest-300 flex items-center justify-center mx-auto border border-forest-500/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="font-serif-heading font-medium text-2xl text-ivory-100">
              Hackathon Successfully Created!
            </h2>
            <p className="text-xs sm:text-sm text-ivory-400 max-w-md mx-auto">
              {successMessage}
            </p>
          </div>
        ) : (
          <div>
            {/* STEP 1: BASIC INFORMATION */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-fade-in">
                <div className="pb-3 border-b border-charcoal-cardBorder">
                  <h3 className="font-serif-heading font-medium text-xl text-ivory-100">
                    Step 1: Basic Information
                  </h3>
                  <p className="text-xs text-ivory-500 mt-0.5">
                    Define your hackathon title, cover imagery, and organizer contact details.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="sm:col-span-2">
                    <label className="font-semibold text-ivory-300 block mb-1 font-mono">
                      Hackathon Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={basicInfo.title}
                      onChange={(e) => setBasicInfo({ ...basicInfo, title: e.target.value })}
                      placeholder="e.g. Global AI Builder Hackathon 2026"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 placeholder-ivory-500 focus:outline-none focus:border-bronze-500/50"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-semibold text-ivory-300 block mb-1 font-mono">
                      Tagline / One-liner
                    </label>
                    <input
                      type="text"
                      value={basicInfo.tagline}
                      onChange={(e) => setBasicInfo({ ...basicInfo, tagline: e.target.value })}
                      placeholder="e.g. Build cutting-edge autonomous agents and win from ₹2,00,000 prize pool"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 placeholder-ivory-500 focus:outline-none focus:border-bronze-500/50"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-semibold text-ivory-300 block mb-1 font-mono">
                      Short Summary *
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={basicInfo.shortDescription}
                      onChange={(e) => setBasicInfo({ ...basicInfo, shortDescription: e.target.value })}
                      placeholder="A 2-3 sentence overview displayed on cards and search results..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 placeholder-ivory-500 focus:outline-none focus:border-bronze-500/50 resize-y"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-semibold text-ivory-300 block mb-1 font-mono">
                      Full Description & Vision *
                    </label>
                    <textarea
                      rows={6}
                      required
                      value={basicInfo.description}
                      onChange={(e) => setBasicInfo({ ...basicInfo, description: e.target.value })}
                      placeholder="Comprehensive details about the hackathon theme, mentorship sessions, team dynamics, criteria, and outcomes..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 placeholder-ivory-500 focus:outline-none focus:border-bronze-500/50 resize-y"
                    />
                  </div>

                  <div className="sm:col-span-2 grid grid-cols-1 md:grid-cols-12 gap-4 p-4 rounded-2xl bg-charcoal-900 border border-charcoal-cardBorder">
                    <div className="md:col-span-4">
                      <ImageUpload
                        folder="organizations"
                        label="Organizer Logo"
                        sublabel="Square PNG, JPG, WEBP (5MB)"
                        aspectRatio="1:1"
                        value={basicInfo.organizerLogo}
                        onChange={(url) => setBasicInfo((prev) => ({ ...prev, organizerLogo: url || "" }))}
                      />
                    </div>
                    <div className="md:col-span-8">
                      <ImageUpload
                        folder="hackathons"
                        label="Cover Banner Image"
                        sublabel="16:9 aspect ratio hero banner image (5MB)"
                        aspectRatio="16:9"
                        value={basicInfo.coverImage}
                        onChange={(url) => setBasicInfo((prev) => ({ ...prev, coverImage: url || "" }))}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-ivory-300 block mb-1 font-mono">
                      Organizer Name / Organization *
                    </label>
                    <input
                      type="text"
                      required
                      value={basicInfo.organizerName}
                      onChange={(e) => setBasicInfo({ ...basicInfo, organizerName: e.target.value })}
                      placeholder="e.g. Stanford AI Club / DevGuild"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 placeholder-ivory-500 focus:outline-none focus:border-bronze-500/50"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-ivory-300 block mb-1 font-mono">
                      Contact Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={basicInfo.contactEmail}
                      onChange={(e) => setBasicInfo({ ...basicInfo, contactEmail: e.target.value })}
                      placeholder="hackathon@org.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 placeholder-ivory-500 focus:outline-none focus:border-bronze-500/50"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-ivory-300 block mb-1 font-mono">
                      Discord / Community Link (Optional)
                    </label>
                    <input
                      type="url"
                      value={basicInfo.discordUrl}
                      onChange={(e) => setBasicInfo({ ...basicInfo, discordUrl: e.target.value })}
                      placeholder="https://discord.gg/your-hackathon"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 placeholder-ivory-500 focus:outline-none focus:border-bronze-500/50"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-ivory-300 block mb-1 font-mono">
                      Official Website Link (Optional)
                    </label>
                    <input
                      type="url"
                      value={basicInfo.websiteUrl}
                      onChange={(e) => setBasicInfo({ ...basicInfo, websiteUrl: e.target.value })}
                      placeholder="https://hackathon.xyz"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 placeholder-ivory-500 focus:outline-none focus:border-bronze-500/50"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: SCHEDULE */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div className="pb-3 border-b border-charcoal-cardBorder">
                  <h3 className="font-serif-heading font-medium text-xl text-ivory-100">
                    Step 2: Hackathon Schedule & Timelines
                  </h3>
                  <p className="text-xs text-ivory-500 mt-0.5">
                    Set precise milestones for registration, hacking, submissions, judging, and winner reveal.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-semibold text-ivory-300 block mb-1 font-mono">
                      Registration Opens
                    </label>
                    <input
                      type="date"
                      value={schedule.regStartDate}
                      onChange={(e) => setSchedule({ ...schedule, regStartDate: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-ivory-300 block mb-1 font-mono">
                      Registration Closes *
                    </label>
                    <input
                      type="date"
                      required
                      value={schedule.regEndDate}
                      onChange={(e) => setSchedule({ ...schedule, regEndDate: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-ivory-300 block mb-1 font-mono">
                      Hackathon Start Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={schedule.startDate}
                      onChange={(e) => setSchedule({ ...schedule, startDate: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-ivory-300 block mb-1 font-mono">
                      Hackathon End Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={schedule.endDate}
                      onChange={(e) => setSchedule({ ...schedule, endDate: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-rose-400 block mb-1 font-mono">
                      Project Submission Deadline *
                    </label>
                    <input
                      type="date"
                      required
                      value={schedule.submissionDeadline}
                      onChange={(e) => setSchedule({ ...schedule, submissionDeadline: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-amber-300 block mb-1 font-mono">
                      Judging Start Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={schedule.judgingStartDate}
                      onChange={(e) => setSchedule({ ...schedule, judgingStartDate: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-amber-300 block mb-1 font-mono">
                      Judging End Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={schedule.judgingEndDate}
                      onChange={(e) => setSchedule({ ...schedule, judgingEndDate: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-forest-300 block mb-1 font-mono">
                      Winner Announcement Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={schedule.winnersAnnouncedDate}
                      onChange={(e) => setSchedule({ ...schedule, winnersAnnouncedDate: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: PARTICIPATION & MODE */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-fade-in">
                <div className="pb-3 border-b border-charcoal-cardBorder">
                  <h3 className="font-serif-heading font-medium text-xl text-ivory-100">
                    Step 3: Participation & Team Configuration
                  </h3>
                  <p className="text-xs text-ivory-500 mt-0.5">
                    Specify attendance mode, team sizes, and optional external registration preferences.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-semibold text-ivory-300 block mb-1 font-mono">
                      Hackathon Mode *
                    </label>
                    <select
                      value={participation.mode}
                      onChange={(e) => setParticipation({ ...participation, mode: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50 cursor-pointer"
                    >
                      <option value="ONLINE">Online / Virtual</option>
                      <option value="OFFLINE">On-site / In-Person</option>
                      <option value="HYBRID">Hybrid (Online + On-site)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-ivory-300 block mb-1 font-mono">
                      Location / Venue
                    </label>
                    <input
                      type="text"
                      value={participation.location}
                      onChange={(e) => setParticipation({ ...participation, location: e.target.value })}
                      placeholder="e.g. San Francisco, CA / Online Worldwide"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-ivory-300 block mb-1 font-mono">
                      Min Team Size
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={participation.minTeamSize}
                      onChange={(e) => setParticipation({ ...participation, minTeamSize: parseInt(e.target.value) || 1 })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50 font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-ivory-300 block mb-1 font-mono">
                      Max Team Size
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={participation.maxTeamSize}
                      onChange={(e) => setParticipation({ ...participation, maxTeamSize: parseInt(e.target.value) || 4 })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50 font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-semibold text-ivory-300 block mb-1 font-mono">
                      Eligibility & Restrictions
                    </label>
                    <input
                      type="text"
                      value={participation.eligibility}
                      onChange={(e) => setParticipation({ ...participation, eligibility: e.target.value })}
                      placeholder="e.g. Open to enrolled college students and recent grads graduating in 2026-2028."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50"
                    />
                  </div>

                  {/* Optional External Registration Toggle */}
                  <div className="sm:col-span-2 p-4 rounded-2xl bg-charcoal-900 border border-charcoal-cardBorder space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-ivory-100">External Registration (Optional)</div>
                        <div className="text-[11px] text-ivory-500">
                          By default, participants register directly inside NIMBLUX. Enable this if you require an external portal redirect.
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={participation.isExternalRegistration}
                          onChange={(e) => setParticipation({ ...participation, isExternalRegistration: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5 bg-charcoal-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-ivory-100 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-bronze-500"></div>
                      </label>
                    </div>

                    {participation.isExternalRegistration && (
                      <div className="pt-2">
                        <label className="font-semibold text-ivory-300 block mb-1 font-mono">
                          External Registration URL *
                        </label>
                        <input
                          type="url"
                          required={participation.isExternalRegistration}
                          value={participation.externalRegistrationUrl}
                          onChange={(e) => setParticipation({ ...participation, externalRegistrationUrl: e.target.value })}
                          placeholder="https://yourhackathon.com/apply"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-950 border border-charcoal-cardBorder text-ivory-100 placeholder-ivory-500 focus:outline-none focus:border-bronze-500/50"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: RULES, TRACKS & CRITERIA */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-fade-in">
                <div className="pb-3 border-b border-charcoal-cardBorder">
                  <h3 className="font-serif-heading font-medium text-xl text-ivory-100">
                    Step 4: Rules, Problem Statements & Tracks
                  </h3>
                  <p className="text-xs text-ivory-500 mt-0.5">
                    Structure custom tracks, problem statements, allowed tech, and judging criteria.
                  </p>
                </div>

                {/* Tracks Builder */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-ivory-100 text-xs font-mono uppercase tracking-wider">
                      Tracks & Themes ({tracks.length})
                    </label>
                    <button
                      type="button"
                      onClick={addTrack}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-bronze-500/15 text-bronze-300 border border-bronze-500/30 hover:bg-bronze-500/25 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Track</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {tracks.map((track, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-charcoal-900 border border-charcoal-cardBorder space-y-3 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[11px] text-bronze-300 font-bold">Track #{idx + 1}</span>
                          {tracks.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeTrack(idx)}
                              className="text-rose-400 hover:text-rose-300 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-ivory-400 block mb-1">Track Name *</label>
                            <input
                              type="text"
                              required
                              value={track.name}
                              onChange={(e) => updateTrack(idx, "name", e.target.value)}
                              placeholder="e.g. AI & Machine Learning"
                              className="w-full px-3 py-2 rounded-xl bg-charcoal-950 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50"
                            />
                          </div>

                          <div>
                            <label className="text-ivory-400 block mb-1">Track Prize (Optional)</label>
                            <input
                              type="text"
                              value={track.prize}
                              onChange={(e) => updateTrack(idx, "prize", e.target.value)}
                              placeholder="e.g. ₹25,000 + Cloud Credits"
                              className="w-full px-3 py-2 rounded-xl bg-charcoal-950 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="text-ivory-400 block mb-1">Problem Statement / Challenge Description</label>
                            <textarea
                              rows={2}
                              value={track.problemStatement}
                              onChange={(e) => updateTrack(idx, "problemStatement", e.target.value)}
                              placeholder="Describe the challenge or open problem for this track..."
                              className="w-full px-3 py-2 rounded-xl bg-charcoal-950 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50 resize-y"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rules textareas */}
                <div className="space-y-4 pt-4 border-t border-charcoal-cardBorder text-xs">
                  <div>
                    <label className="font-semibold text-ivory-300 block mb-1 font-mono">
                      Hackathon Rules & Guidelines
                    </label>
                    <textarea
                      rows={3}
                      value={rulesData.rules}
                      onChange={(e) => setRulesData({ ...rulesData, rules: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50 resize-y"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-ivory-300 block mb-1 font-mono">
                      Submission Requirements
                    </label>
                    <input
                      type="text"
                      value={rulesData.submissionRequirements}
                      onChange={(e) => setRulesData({ ...rulesData, submissionRequirements: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: PRIZES & REWARDS */}
            {currentStep === 5 && (
              <div className="space-y-6 animate-fade-in">
                <div className="pb-3 border-b border-charcoal-cardBorder flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-serif-heading font-medium text-xl text-ivory-100">
                      Step 5: Prize Pool & Rewards
                    </h3>
                    <p className="text-xs text-ivory-500 mt-0.5">
                      Configure cash prize tiers, sponsor prizes, non-cash perks, and verified certificates.
                    </p>
                  </div>

                  <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono font-bold text-sm">
                    <Trophy className="w-4 h-4" />
                    <span>Total Calculated: {formatCurrency(computedTotal, prizeCurrency)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-semibold text-ivory-300 block mb-1 font-mono">
                      Currency
                    </label>
                    <select
                      value={prizeCurrency}
                      onChange={(e) => setPrizeCurrency(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50 cursor-pointer"
                    >
                      <option value="INR">INR (₹) Indian Rupee</option>
                      <option value="USD">USD ($) US Dollar</option>
                      <option value="EUR">EUR (€) Euro</option>
                      <option value="GBP">GBP (£) British Pound</option>
                    </select>
                  </div>
                </div>

                {/* Prizes Builder */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-ivory-100 text-xs font-mono uppercase tracking-wider">
                      Prize Breakdown ({prizes.length})
                    </label>
                    <button
                      type="button"
                      onClick={addPrize}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Prize Tier</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {prizes.map((p, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-charcoal-900 border border-charcoal-cardBorder space-y-3 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-base font-bold font-mono text-amber-400">
                              {p.type === "1ST" ? "🥇 1st Prize" : p.type === "2ND" ? "🥈 2nd Prize" : p.type === "3RD" ? "🥉 3rd Prize" : "🏅 Special Prize"}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removePrize(idx)}
                            className="text-rose-400 hover:text-rose-300 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="sm:col-span-2">
                            <label className="text-ivory-400 block mb-1">Prize Title *</label>
                            <input
                              type="text"
                              required
                              value={p.name}
                              onChange={(e) => updatePrize(idx, "name", e.target.value)}
                              placeholder="e.g. 1st Place Champion"
                              className="w-full px-3 py-2 rounded-xl bg-charcoal-950 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50"
                            />
                          </div>

                          <div>
                            <label className="text-ivory-400 block mb-1">Cash Amount (Numeric)</label>
                            <input
                              type="text"
                              value={p.amount}
                              onChange={(e) => updatePrize(idx, "amount", e.target.value)}
                              placeholder="e.g. 50000"
                              className="w-full px-3 py-2 rounded-xl bg-charcoal-950 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50 font-mono"
                            />
                          </div>

                          <div>
                            <label className="text-ivory-400 block mb-1">Physical / Non-Cash Reward</label>
                            <input
                              type="text"
                              value={p.physicalReward}
                              onChange={(e) => updatePrize(idx, "physicalReward", e.target.value)}
                              placeholder="e.g. MacBook Pro, T-Shirts"
                              className="w-full px-3 py-2 rounded-xl bg-charcoal-950 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="text-ivory-400 block mb-1">Additional Benefits (Interviews, Mentorship)</label>
                            <input
                              type="text"
                              value={p.additionalBenefits}
                              onChange={(e) => updatePrize(idx, "additionalBenefits", e.target.value)}
                              placeholder="e.g. Fast-track job interviews + Cloud credits"
                              className="w-full px-3 py-2 rounded-xl bg-charcoal-950 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Stepper Navigation Buttons */}
            <div className="pt-6 border-t border-charcoal-cardBorder flex items-center justify-between">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl font-semibold text-xs text-ivory-300 hover:text-white bg-charcoal-900 border border-charcoal-cardBorder transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
              ) : (
                <Link
                  href="/hackathons"
                  className="text-xs font-semibold text-ivory-500 hover:text-ivory-300 transition-colors"
                >
                  Cancel
                </Link>
              )}

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleSubmit(true)}
                  className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-xl font-semibold text-xs text-ivory-200 bg-charcoal-900 hover:bg-charcoal-850 border border-charcoal-cardBorder transition-colors"
                >
                  <Save className="w-3.5 h-3.5 text-bronze-400" />
                  <span>Save Draft</span>
                </button>

                {currentStep < 5 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(currentStep + 1)}
                    className="inline-flex items-center space-x-1.5 px-6 py-2.5 rounded-xl font-bold text-xs text-charcoal-950 bg-bronze-500 hover:bg-bronze-400 shadow-button transition-all"
                  >
                    <span>Next Step</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleSubmit(false)}
                    className="inline-flex items-center space-x-2 px-7 py-2.5 rounded-xl font-bold text-xs text-charcoal-950 bg-bronze-500 hover:bg-bronze-400 shadow-button transition-all"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{loading ? "Submitting..." : "Submit for Moderation Review"}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
