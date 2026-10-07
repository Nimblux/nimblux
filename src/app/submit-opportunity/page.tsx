"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Briefcase,
  Building2,
  Code,
  Sparkles,
  Trophy,
  Calendar,
  GraduationCap,
  Award,
  BookOpen,
  Layers,
  Video,
  Mic2,
  HeartHandshake,
  School,
  Compass,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Globe,
  MapPin,
  Clock,
  DollarSign,
  ShieldCheck,
  Eye,
  Save,
  Send,
  HelpCircle,
  FileText,
  Sliders,
  ExternalLink,
} from "lucide-react";
import { OPPORTUNITY_TYPES, WORK_MODES, CATEGORIES } from "@/lib/constants";
import ImageUpload from "@/components/common/ImageUpload";
import { slugify } from "@/lib/utils";

interface CustomQuestion {
  id: string;
  label: string;
  type: "text" | "textarea" | "select" | "checkbox" | "url" | "file";
  options?: string[];
  required: boolean;
  placeholder?: string;
}

const STEPS = [
  { id: 1, name: "Type", desc: "Select opportunity type" },
  { id: 2, name: "Basics", desc: "Title, organization, media" },
  { id: 3, name: "Details", desc: "Type-specific specifications" },
  { id: 4, name: "Participation", desc: "Native vs external flow" },
  { id: 5, name: "Questions", desc: "Custom screening questions" },
  { id: 6, name: "Prize Pool", desc: "Rewards and recognition" },
  { id: 7, name: "Preview & Publish", desc: "Final review & submit" },
];

export default function SubmitOpportunityPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [savedSlug, setSavedSlug] = useState("");

  // Selected Type
  const [selectedType, setSelectedType] = useState("INTERNSHIP");

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    category: "internships",
    opportunityType: "INTERNSHIP",
    organization: "",
    logo: "",
    banner: "",
    location: "Remote",
    country: "India",
    mode: "REMOTE",
    eligibility: "",
    skills: "",
    stipend: "",
    salary: "",
    registrationFee: "Free",
    isPaid: false,
    isExternal: false,
    externalUrl: "",
    applicationUrl: "",
    deadline: "",
    startDate: "",
    endDate: "",
    contactInfo: "",
    additionalInfo: "",
    shortDescription: "",
    description: "",

    // Type specialized fields
    department: "",
    duration: "",
    experienceLevel: "ALL",
    responsibilities: "",
    requirements: "",
    benefits: "",
    instructor: "",
    curriculum: "",
    capacity: "",
    price: "",
    currency: "INR",
    venue: "",
    meetingUrl: "",
    agenda: "",
    faq: "",
    rules: "",

    // Prize Pool
    hasPrizePool: false,
    totalPrizePool: "",
    prizeCurrency: "INR",
    prize1st: "",
    prize2nd: "",
    prize3rd: "",
    prizeSpecial: "",
    prizeDetails: "",
  });

  // Custom Questions State
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([]);
  const [newQuestionLabel, setNewQuestionLabel] = useState("");
  const [newQuestionType, setNewQuestionType] = useState<CustomQuestion["type"]>("text");
  const [newQuestionRequired, setNewQuestionRequired] = useState(true);
  const [newQuestionOptions, setNewQuestionOptions] = useState("");

  // Auto slug generation
  useEffect(() => {
    if (formData.title && !formData.slug) {
      const generated = slugify(`${formData.organization || "nimblux"}-${formData.title}`);
      setFormData((prev) => ({ ...prev, slug: generated }));
    }
  }, [formData.title, formData.organization]);

  // Verify auth on mount and prefill organization details
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (!data.user) {
          router.push("/login?redirect=/submit-opportunity");
        } else {
          setUser(data.user);
          if (data.user.organizationName) {
            setFormData((prev) => ({
              ...prev,
              organization: prev.organization || data.user.organizationName || "",
              logo: prev.logo || data.user.organizationLogo || "",
              contactInfo: prev.contactInfo || data.user.organizationEmail || data.user.email || "",
            }));
          }
        }
      })
      .catch(() => {
        router.push("/login?redirect=/submit-opportunity");
      })
      .finally(() => setCheckingAuth(false));
  }, [router]);

  const handleTypeSelect = (typeKey: string) => {
    setSelectedType(typeKey);
    const typeMeta = OPPORTUNITY_TYPES.find((t) => t.type === typeKey);
    const categorySlug = typeMeta ? typeMeta.categorySlug : "other";

    setFormData((prev) => ({
      ...prev,
      opportunityType: typeKey,
      category: categorySlug,
      hasPrizePool:
        typeKey === "COMPETITION" || typeKey === "HACKATHON" || typeKey === "CHALLENGE"
          ? true
          : prev.hasPrizePool,
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddQuestion = () => {
    if (!newQuestionLabel.trim()) return;

    const optionsArray =
      (newQuestionType === "select" || newQuestionType === "checkbox") && newQuestionOptions.trim()
        ? newQuestionOptions.split(",").map((s) => s.trim()).filter(Boolean)
        : undefined;

    const newQ: CustomQuestion = {
      id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      label: newQuestionLabel.trim(),
      type: newQuestionType,
      required: newQuestionRequired,
      options: optionsArray,
    };

    setCustomQuestions((prev) => [...prev, newQ]);
    setNewQuestionLabel("");
    setNewQuestionOptions("");
    setNewQuestionRequired(true);
  };

  const handleRemoveQuestion = (id: string) => {
    setCustomQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const validateCurrentStep = () => {
    setError("");
    if (currentStep === 2) {
      if (!formData.title.trim()) {
        setError("Opportunity Title is required.");
        return false;
      }
      if (!formData.organization.trim()) {
        setError("Organization Name is required.");
        return false;
      }
      if (!formData.description.trim()) {
        setError("Full Description is required.");
        return false;
      }
    }
    if (currentStep === 3) {
      if (!formData.deadline) {
        setError("Application Deadline date is required.");
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, 7));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    setError("");
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (submitStatus: "DRAFT" | "PENDING") => {
    setError("");
    setLoading(true);

    try {
      const payload = {
        ...formData,
        status: submitStatus,
        customQuestions: customQuestions.length > 0 ? JSON.stringify(customQuestions) : null,
      };

      const res = await fetch("/api/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit opportunity.");
      }

      setSavedSlug(data.opportunity?.slug || formData.slug);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#D8B77A] border-t-transparent animate-spin" />
      </div>
    );
  }

  const getTypeIcon = (iconName: string) => {
    switch (iconName) {
      case "Briefcase": return Briefcase;
      case "Building2": return Building2;
      case "Code": return Code;
      case "Sparkles": return Sparkles;
      case "Trophy": return Trophy;
      case "Calendar": return Calendar;
      case "GraduationCap": return GraduationCap;
      case "Award": return Award;
      case "BookOpen": return BookOpen;
      case "Layers": return Layers;
      case "Video": return Video;
      case "Mic2": return Mic2;
      case "HeartHandshake": return HeartHandshake;
      case "School": return School;
      default: return Compass;
    }
  };

  if (success) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full rounded-[20px] bg-[#111615] border border-white/[0.12] p-8 text-center space-y-6 shadow-2xl animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-[#8FA58E]/15 border border-[#8FA58E]/30 flex items-center justify-center text-[#8FA58E] mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-[#F5F1E8] tracking-tight">
              Opportunity Created!
            </h2>
            <p className="text-xs text-[#A9AAA5] leading-relaxed">
              Your opportunity has been queued for verification and moderator approval. You will receive an alert once approved.
            </p>
          </div>

          <div className="p-3 rounded-[10px] bg-[#0E1110] border border-white/[0.06] text-xs font-mono text-[#D8B77A] break-all">
            https://nimblux.xyz/opportunity/{savedSlug}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href={`/opportunity/${savedSlug}`}
              className="flex-1 py-2.5 px-4 rounded-[10px] font-semibold text-xs text-[#090B0B] bg-[#D8B77A] hover:bg-[#E7D5B2] transition-colors"
            >
              View Opportunity
            </Link>
            <Link
              href="/organizer/opportunities"
              className="flex-1 py-2.5 px-4 rounded-[10px] font-medium text-xs text-[#F5F1E8] bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] transition-colors"
            >
              Organizer Console
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="inline-flex items-center space-x-2 text-[#D8B77A] text-xs font-mono font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Publishing Studio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-[700] text-[#F5F1E8] tracking-tight">
            Create an Opportunity
          </h1>
          <p className="text-xs text-[#A9AAA5] mt-1">
            Structured opportunity creation supporting internships, hackathons, workshops, and jobs.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/organizer"
            className="px-3 py-1.5 rounded-[8px] text-xs font-medium text-[#A9AAA5] hover:text-[#F5F1E8] bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] transition-colors"
          >
            Organizer Console
          </Link>
        </div>
      </div>

      {/* Step Progress Bar */}
      <div className="overflow-x-auto pb-2">
        <div className="flex items-center min-w-[620px] justify-between">
          {STEPS.map((step) => {
            const isCompleted = step.id < currentStep;
            const isCurrent = step.id === currentStep;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => {
                  if (isCompleted || step.id <= currentStep) {
                    setCurrentStep(step.id);
                  }
                }}
                className={`flex items-center space-x-2 py-2 px-3 rounded-[10px] text-xs transition-all ${
                  isCurrent
                    ? "bg-[#D8B77A]/15 text-[#D8B77A] font-semibold border border-[#D8B77A]/30"
                    : isCompleted
                    ? "text-[#8FA58E] hover:bg-white/[0.03]"
                    : "text-[#7E807B] cursor-not-allowed opacity-60"
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10.5px] font-mono font-bold ${
                    isCurrent
                      ? "bg-[#D8B77A] text-[#090B0B]"
                      : isCompleted
                      ? "bg-[#8FA58E]/20 text-[#8FA58E]"
                      : "bg-white/[0.05] text-[#7E807B]"
                  }`}
                >
                  {isCompleted ? "✓" : step.id}
                </span>
                <span>{step.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-3.5 rounded-[12px] bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2 animate-fade-in">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Step Content Container */}
      <div className="rounded-[18px] bg-[#111615] border border-white/[0.08] p-6 sm:p-8 shadow-card space-y-6">
        {/* STEP 1: CHOOSE OPPORTUNITY TYPE */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-[#F5F1E8]">
                What type of opportunity are you creating?
              </h2>
              <p className="text-xs text-[#A9AAA5] mt-1">
                Choose the architecture that best fits your listing. Fields and workflows will dynamically customize.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {OPPORTUNITY_TYPES.map((typeMeta) => {
                const IconComponent = getTypeIcon(typeMeta.icon);
                const isSelected = selectedType === typeMeta.type;

                return (
                  <div
                    key={typeMeta.type}
                    onClick={() => handleTypeSelect(typeMeta.type)}
                    className={`p-4 rounded-[14px] cursor-pointer transition-all border flex flex-col justify-between space-y-3 ${
                      isSelected
                        ? "bg-[#D8B77A]/10 border-[#D8B77A] shadow-md shadow-[#D8B77A]/5"
                        : "bg-[#0E1110] border-white/[0.06] hover:border-white/[0.15] hover:bg-white/[0.02]"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div
                          className={`w-9 h-9 rounded-[9px] flex items-center justify-center ${
                            isSelected
                              ? "bg-[#D8B77A] text-[#090B0B]"
                              : "bg-white/[0.04] text-[#D8B77A]"
                          }`}
                        >
                          <IconComponent className="w-4 h-4" />
                        </div>
                        {isSelected && (
                          <span className="text-[10px] font-mono font-bold text-[#D8B77A]">
                            SELECTED
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-xs text-[#F5F1E8]">
                        {typeMeta.name}
                      </h3>
                      <p className="text-[11px] text-[#A9AAA5] leading-relaxed line-clamp-2">
                        {typeMeta.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[10px] font-mono text-[#7E807B]">
                      <span>Mode: {typeMeta.modeLabel}</span>
                      <span>→</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2: BASIC INFORMATION */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-[#F5F1E8]">
                Basic Information & Media
              </h2>
              <p className="text-xs text-[#A9AAA5] mt-1">
                Essential identity, cloud-hosted images, location, and link configuration.
              </p>
            </div>

            <div className="space-y-4">
              {/* Title & Org */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#A9AAA5] mb-1 font-semibold">
                    Opportunity Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Full-Stack Developer Intern"
                    className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#090B0B] border border-white/[0.08] text-xs text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#A9AAA5] mb-1 font-semibold">
                    Organization / Company Name *
                  </label>
                  <input
                    type="text"
                    name="organization"
                    required
                    value={formData.organization}
                    onChange={handleChange}
                    placeholder="e.g. Acme Technologies"
                    className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#090B0B] border border-white/[0.08] text-xs text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
                  />
                </div>
              </div>

              {/* Logo & Banner Upload (Cloudinary) */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 rounded-[14px] bg-[#0E1110] border border-white/[0.06]">
                <div className="md:col-span-4">
                  <ImageUpload
                    folder="organizations"
                    label="Organization Logo"
                    sublabel="Square PNG, JPG, WEBP, SVG (5MB)"
                    aspectRatio="1:1"
                    value={formData.logo}
                    onChange={(url) => setFormData((prev) => ({ ...prev, logo: url || "" }))}
                  />
                </div>

                <div className="md:col-span-8">
                  <ImageUpload
                    folder="opportunities"
                    label="Opportunity Hero Banner"
                    sublabel="16:9 aspect ratio hero banner image"
                    aspectRatio="16:9"
                    value={formData.banner}
                    onChange={(url) => setFormData((prev) => ({ ...prev, banner: url || "" }))}
                  />
                </div>
              </div>

              {/* Slug & Live Preview */}
              <div className="p-4 rounded-[12px] bg-[#0E1110] border border-white/[0.06] space-y-2">
                <label className="block text-[11px] font-mono uppercase text-[#A9AAA5] font-semibold">
                  Custom Opportunity Slug
                </label>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-[#7E807B] font-mono hidden sm:inline">
                    nimblux.xyz/opportunity/
                  </span>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    placeholder="frontend-developer-intern"
                    className="flex-1 px-3 py-2 rounded-[8px] bg-[#090B0B] border border-white/[0.08] text-xs font-mono text-[#D8B77A] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
                  />
                </div>
                <div className="text-[11px] text-[#A9AAA5] font-mono">
                  Live URL Preview: <span className="text-[#D8B77A]">https://nimblux.xyz/opportunity/{formData.slug || "your-slug"}</span>
                </div>
              </div>

              {/* Location, Mode, Country */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#A9AAA5] mb-1 font-semibold">
                    Work / Event Mode
                  </label>
                  <select
                    name="mode"
                    value={formData.mode}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#090B0B] border border-white/[0.08] text-xs text-[#F5F1E8] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
                  >
                    <option value="REMOTE">Remote / Online</option>
                    <option value="HYBRID">Hybrid</option>
                    <option value="ONSITE">On-site / Offline</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#A9AAA5] mb-1 font-semibold">
                    Location / City
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. Bangalore or Remote"
                    className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#090B0B] border border-white/[0.08] text-xs text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#A9AAA5] mb-1 font-semibold">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    placeholder="e.g. India"
                    className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#090B0B] border border-white/[0.08] text-xs text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
                  />
                </div>
              </div>

              {/* Tags / Skills */}
              <div>
                <label className="block text-[11px] font-mono uppercase text-[#A9AAA5] mb-1 font-semibold">
                  Required Skills & Tags (comma separated)
                </label>
                <input
                  type="text"
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder="e.g. React, Next.js, Node.js, Python, Figma"
                  className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#090B0B] border border-white/[0.08] text-xs text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
                />
              </div>

              {/* Short & Full Description */}
              <div>
                <label className="block text-[11px] font-mono uppercase text-[#A9AAA5] mb-1 font-semibold">
                  Short Summary
                </label>
                <input
                  type="text"
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleChange}
                  placeholder="A concise 1-sentence overview for cards and meta preview"
                  className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#090B0B] border border-white/[0.08] text-xs text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-[#A9AAA5] mb-1 font-semibold">
                  Full Opportunity Description *
                </label>
                <textarea
                  name="description"
                  required
                  rows={6}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Detailed overview about this role, event, program, or challenge..."
                  className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#090B0B] border border-white/[0.08] text-xs text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors resize-y"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: OPPORTUNITY-SPECIFIC INFORMATION */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-[#F5F1E8]">
                {selectedType} Specific Details
              </h2>
              <p className="text-xs text-[#A9AAA5] mt-1">
                Configure parameters unique to {selectedType.toLowerCase()} listings.
              </p>
            </div>

            {/* Common Timeline Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-[14px] bg-[#0E1110] border border-white/[0.06]">
              <div>
                <label className="block text-[11px] font-mono uppercase text-[#A9AAA5] mb-1 font-semibold">
                  Application Deadline *
                </label>
                <input
                  type="date"
                  name="deadline"
                  required
                  value={formData.deadline}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-[8px] bg-[#090B0B] border border-white/[0.08] text-xs text-[#F5F1E8] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-[#A9AAA5] mb-1 font-semibold">
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-[8px] bg-[#090B0B] border border-white/[0.08] text-xs text-[#F5F1E8] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-[#A9AAA5] mb-1 font-semibold">
                  End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-[8px] bg-[#090B0B] border border-white/[0.08] text-xs text-[#F5F1E8] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
                />
              </div>
            </div>

            {/* INTERNSHIP SPECIFICS */}
            {selectedType === "INTERNSHIP" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-[#A9AAA5] mb-1 font-semibold">
                      Monthly Stipend
                    </label>
                    <input
                      type="text"
                      name="stipend"
                      value={formData.stipend}
                      onChange={handleChange}
                      placeholder="e.g. ₹25,000 / month"
                      className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#090B0B] border border-white/[0.08] text-xs text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase text-[#A9AAA5] mb-1 font-semibold">
                      Internship Duration
                    </label>
                    <input
                      type="text"
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      placeholder="e.g. 3 Months or 6 Months"
                      className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#090B0B] border border-white/[0.08] text-xs text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase text-[#A9AAA5] mb-1 font-semibold">
                      Eligibility
                    </label>
                    <input
                      type="text"
                      name="eligibility"
                      value={formData.eligibility}
                      onChange={handleChange}
                      placeholder="e.g. B.Tech 2025/2026 Batch"
                      className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#090B0B] border border-white/[0.08] text-xs text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#A9AAA5] mb-1 font-semibold">
                    Key Responsibilities
                  </label>
                  <textarea
                    name="responsibilities"
                    rows={3}
                    value={formData.responsibilities}
                    onChange={handleChange}
                    placeholder="Bullet points on candidate day-to-day responsibilities..."
                    className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#090B0B] border border-white/[0.08] text-xs text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#A9AAA5] mb-1 font-semibold">
                    Qualifications & Requirements
                  </label>
                  <textarea
                    name="requirements"
                    rows={3}
                    value={formData.requirements}
                    onChange={handleChange}
                    placeholder="Candidate qualifications, degree requirement, and prerequisites..."
                    className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#090B0B] border border-white/[0.08] text-xs text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#A9AAA5] mb-1 font-semibold">
                    Perks & Benefits
                  </label>
                  <input
                    type="text"
                    name="benefits"
                    value={formData.benefits}
                    onChange={handleChange}
                    placeholder="e.g. Certificate of completion, PPO opportunity, flexible hours"
                    className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#090B0B] border border-white/[0.08] text-xs text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
                  />
                </div>
              </div>
            )}

            {/* JOB SPECIFICS */}
            {selectedType === "JOB" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-[#A9AAA5] mb-1 font-semibold">
                      Annual Salary (CTC)
                    </label>
                    <input
                      type="text"
                      name="salary"
                      value={formData.salary}
                      onChange={handleChange}
                      placeholder="e.g. ₹12,00,000 - ₹18,00,000"
                      className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#090B0B] border border-white/[0.08] text-xs text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase text-[#A9AAA5] mb-1 font-semibold">
                      Experience Level
                    </label>
                    <select
                      name="experienceLevel"
                      value={formData.experienceLevel}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#090B0B] border border-white/[0.08] text-xs text-[#F5F1E8] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
                    >
                      <option value="ENTRY">Entry Level / Fresh Grad</option>
                      <option value="INTERMEDIATE">Mid-Level (1-3 Years)</option>
                      <option value="SENIOR">Senior (3+ Years)</option>
                      <option value="ALL">All Levels Welcome</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase text-[#A9AAA5] mb-1 font-semibold">
                      Department / Function
                    </label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      placeholder="e.g. Engineering, Product"
                      className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#090B0B] border border-white/[0.08] text-xs text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#A9AAA5] mb-1 font-semibold">
                    Responsibilities
                  </label>
                  <textarea
                    name="responsibilities"
                    rows={3}
                    value={formData.responsibilities}
                    onChange={handleChange}
                    placeholder="Day-to-day work, engineering roadmap, product development..."
                    className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#090B0B] border border-white/[0.08] text-xs text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#A9AAA5] mb-1 font-semibold">
                    Requirements
                  </label>
                  <textarea
                    name="requirements"
                    rows={3}
                    value={formData.requirements}
                    onChange={handleChange}
                    placeholder="Technical skills, prior project work, system design..."
                    className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#090B0B] border border-white/[0.08] text-xs text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
                  />
                </div>
              </div>
            )}

            {/* HACKATHON / COMPETITION SPECIFICS */}
            {(selectedType === "HACKATHON" || selectedType === "COMPETITION" || selectedType === "CHALLENGE") && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-[#A9AAA5] mb-1 font-semibold">
                      Hackathon / Contest Theme
                    </label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      placeholder="e.g. AI Agents & Decentralized Protocols"
                      className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#090B0B] border border-white/[0.08] text-xs text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase text-[#A9AAA5] mb-1 font-semibold">
                      Max Team Size
                    </label>
                    <input
                      type="text"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleChange}
                      placeholder="e.g. 4 Members"
                      className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#090B0B] border border-white/[0.08] text-xs text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#A9AAA5] mb-1 font-semibold">
                    Problem Statements & Tracks
                  </label>
                  <textarea
                    name="agenda"
                    rows={3}
                    value={formData.agenda}
                    onChange={handleChange}
                    placeholder="List tracks: Web3, Generative AI, Open Innovation, Fintech..."
                    className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#090B0B] border border-white/[0.08] text-xs text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#A9AAA5] mb-1 font-semibold">
                    Submission Guidelines & Rules
                  </label>
                  <textarea
                    name="rules"
                    rows={3}
                    value={formData.rules}
                    onChange={handleChange}
                    placeholder="Code requirements, GitHub repo public link, pitch video..."
                    className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#090B0B] border border-white/[0.08] text-xs text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
                  />
                </div>
              </div>
            )}

            {/* WORKSHOP / EVENT / COURSE SPECIFICS */}
            {(selectedType === "WORKSHOP" || selectedType === "EVENT" || selectedType === "COURSE" || selectedType === "BOOTCAMP" || selectedType === "WEBINAR") && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-[#A9AAA5] mb-1 font-semibold">
                      Instructor / Keynote Speaker
                    </label>
                    <input
                      type="text"
                      name="instructor"
                      value={formData.instructor}
                      onChange={handleChange}
                      placeholder="e.g. Dr. Jane Doe (Principal AI Engineer)"
                      className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#090B0B] border border-white/[0.08] text-xs text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase text-[#A9AAA5] mb-1 font-semibold">
                      Registration Fee / Ticket Price
                    </label>
                    <input
                      type="text"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="Free or ₹499"
                      className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#090B0B] border border-white/[0.08] text-xs text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase text-[#A9AAA5] mb-1 font-semibold">
                      Max Attendee Capacity
                    </label>
                    <input
                      type="number"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleChange}
                      placeholder="e.g. 250"
                      className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#090B0B] border border-white/[0.08] text-xs text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-[#A9AAA5] mb-1 font-semibold">
                      Venue / Physical Location
                    </label>
                    <input
                      type="text"
                      name="venue"
                      value={formData.venue}
                      onChange={handleChange}
                      placeholder="e.g. Main Auditorium, Tech Hub"
                      className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#090B0B] border border-white/[0.08] text-xs text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase text-[#A9AAA5] mb-1 font-semibold">
                      Virtual Meeting Link (Private to attendees)
                    </label>
                    <input
                      type="url"
                      name="meetingUrl"
                      value={formData.meetingUrl}
                      onChange={handleChange}
                      placeholder="https://meet.google.com/..."
                      className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#090B0B] border border-white/[0.08] text-xs text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#A9AAA5] mb-1 font-semibold">
                    Curriculum / Session Agenda
                  </label>
                  <textarea
                    name="curriculum"
                    rows={4}
                    value={formData.curriculum}
                    onChange={handleChange}
                    placeholder="Outline session topics, timeline breakdown, modules..."
                    className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#090B0B] border border-white/[0.08] text-xs text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
                  />
                </div>
              </div>
            )}

            {/* SCHOLARSHIP SPECIFICS */}
            {selectedType === "SCHOLARSHIP" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-[#A9AAA5] mb-1 font-semibold">
                      Scholarship Award Amount
                    </label>
                    <input
                      type="text"
                      name="stipend"
                      value={formData.stipend}
                      onChange={handleChange}
                      placeholder="e.g. ₹1,00,000 or $5,000 USD"
                      className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#090B0B] border border-white/[0.08] text-xs text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase text-[#A9AAA5] mb-1 font-semibold">
                      Target Education Level
                    </label>
                    <input
                      type="text"
                      name="eligibility"
                      value={formData.eligibility}
                      onChange={handleChange}
                      placeholder="e.g. Undergraduate Engineering Students"
                      className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#090B0B] border border-white/[0.08] text-xs text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#A9AAA5] mb-1 font-semibold">
                    Selection Process & Required Documents
                  </label>
                  <textarea
                    name="requirements"
                    rows={3}
                    value={formData.requirements}
                    onChange={handleChange}
                    placeholder="Academic transcripts, essay submission, financial criteria..."
                    className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#090B0B] border border-white/[0.08] text-xs text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 4: PARTICIPATION METHOD */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-[#F5F1E8]">
                Participation & Application Method
              </h2>
              <p className="text-xs text-[#A9AAA5] mt-1">
                Choose whether candidates participate directly within NIMBLUX or through an external website.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Internal Option */}
              <div
                onClick={() => setFormData((prev) => ({ ...prev, isExternal: false }))}
                className={`p-5 rounded-[14px] cursor-pointer transition-all border space-y-3 ${
                  !formData.isExternal
                    ? "bg-[#D8B77A]/10 border-[#D8B77A] shadow-lg shadow-[#D8B77A]/5"
                    : "bg-[#0E1110] border-white/[0.06] hover:border-white/[0.15]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-[#D8B77A]/20 text-[#D8B77A] flex items-center justify-center font-bold">
                      ✓
                    </div>
                    <span className="font-semibold text-xs text-[#F5F1E8]">
                      Direct In-Platform Workflow
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-[5px] text-[10px] font-mono text-[#8FA58E] bg-[#8FA58E]/10 border border-[#8FA58E]/25">
                    RECOMMENDED
                  </span>
                </div>
                <p className="text-xs text-[#A9AAA5] leading-relaxed">
                  Users apply and register directly on NIMBLUX with profile autofill, custom screening questions, real-time pipeline management, and instant notifications.
                </p>
                <div className="text-[11px] font-mono text-[#D8B77A]">
                  • Zero candidate drop-off • Built-in reviewer ranking
                </div>
              </div>

              {/* External Option */}
              <div
                onClick={() => setFormData((prev) => ({ ...prev, isExternal: true }))}
                className={`p-5 rounded-[14px] cursor-pointer transition-all border space-y-3 ${
                  formData.isExternal
                    ? "bg-[#D8B77A]/10 border-[#D8B77A]"
                    : "bg-[#0E1110] border-white/[0.06] hover:border-white/[0.15]"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-white/[0.05] text-[#A9AAA5] flex items-center justify-center font-mono text-xs">
                    ↗
                  </div>
                  <span className="font-semibold text-xs text-[#F5F1E8]">
                    External Website Redirection
                  </span>
                </div>
                <p className="text-xs text-[#A9AAA5] leading-relaxed">
                  Redirect applicants to your organization's corporate career page, Google Form, or third-party portal.
                </p>
                <div className="text-[11px] font-mono text-[#7E807B]">
                  • Users will leave NIMBLUX to finish applying
                </div>
              </div>
            </div>

            {formData.isExternal && (
              <div className="p-4 rounded-[12px] bg-[#0E1110] border border-white/[0.08] space-y-3 animate-fade-in">
                <label className="block text-[11px] font-mono uppercase text-[#A9AAA5] font-semibold">
                  External Application URL *
                </label>
                <input
                  type="url"
                  name="externalUrl"
                  required={formData.isExternal}
                  value={formData.externalUrl}
                  onChange={handleChange}
                  placeholder="https://careers.yourcompany.com/job/12345"
                  className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#090B0B] border border-white/[0.08] text-xs text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
                />
                <p className="text-[11px] text-[#A9AAA5]">
                  Applicants will be provided a clear "Apply on External Site" action pointing to this link.
                </p>
              </div>
            )}
          </div>
        )}

        {/* STEP 5: CUSTOM SCREENING QUESTIONS */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-[#F5F1E8]">
                Custom Screening Questions
              </h2>
              <p className="text-xs text-[#A9AAA5] mt-1">
                Add screening prompts for candidates (e.g. portfolio link, experience with PyTorch, cover note).
              </p>
            </div>

            {/* Questions List */}
            {customQuestions.length > 0 && (
              <div className="space-y-3">
                {customQuestions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="flex items-center justify-between p-3.5 rounded-[12px] bg-[#0E1110] border border-white/[0.06]"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold text-[#F5F1E8]">
                          {idx + 1}. {q.label}
                        </span>
                        {q.required && (
                          <span className="text-[10px] text-rose-400 font-mono">* Required</span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#A9AAA5] font-mono">
                        Type: {q.type} {q.options ? `(${q.options.join(", ")})` : ""}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(q.id)}
                      className="p-1.5 rounded-[6px] text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete Question"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Question Box */}
            <div className="p-4 rounded-[14px] bg-[#0E1110] border border-white/[0.06] space-y-4">
              <h3 className="font-semibold text-xs text-[#F5F1E8] uppercase tracking-wider font-mono">
                + Add a Question
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-8">
                  <label className="block text-[11px] font-mono text-[#A9AAA5] mb-1">
                    Question Label / Prompt
                  </label>
                  <input
                    type="text"
                    value={newQuestionLabel}
                    onChange={(e) => setNewQuestionLabel(e.target.value)}
                    placeholder="e.g. Share a link to your best open source repository"
                    className="w-full px-3 py-2 rounded-[8px] bg-[#090B0B] border border-white/[0.08] text-xs text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-[11px] font-mono text-[#A9AAA5] mb-1">
                    Answer Format
                  </label>
                  <select
                    value={newQuestionType}
                    onChange={(e) => setNewQuestionType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-[8px] bg-[#090B0B] border border-white/[0.08] text-xs text-[#F5F1E8] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
                  >
                    <option value="text">Short Text</option>
                    <option value="textarea">Long Text / Paragraph</option>
                    <option value="select">Dropdown Selection</option>
                    <option value="checkbox">Checkbox Choice</option>
                    <option value="url">URL / Web Link</option>
                    <option value="file">File Upload / Document</option>
                  </select>
                </div>
              </div>

              {(newQuestionType === "select" || newQuestionType === "checkbox") && (
                <div>
                  <label className="block text-[11px] font-mono text-[#A9AAA5] mb-1">
                    Options (comma separated)
                  </label>
                  <input
                    type="text"
                    value={newQuestionOptions}
                    onChange={(e) => setNewQuestionOptions(e.target.value)}
                    placeholder="e.g. Beginner, Intermediate, Expert"
                    className="w-full px-3 py-2 rounded-[8px] bg-[#090B0B] border border-white/[0.08] text-xs text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
                  />
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center space-x-2 cursor-pointer text-xs text-[#A9AAA5]">
                  <input
                    type="checkbox"
                    checked={newQuestionRequired}
                    onChange={(e) => setNewQuestionRequired(e.target.checked)}
                    className="rounded bg-[#090B0B] border-white/[0.1] text-[#D8B77A] focus:ring-0"
                  />
                  <span>Mark as required for candidates</span>
                </label>

                <button
                  type="button"
                  onClick={handleAddQuestion}
                  disabled={!newQuestionLabel.trim()}
                  className="px-4 py-1.5 rounded-[8px] font-semibold text-xs text-[#090B0B] bg-[#D8B77A] hover:bg-[#E7D5B2] disabled:opacity-40 transition-colors"
                >
                  Add Question
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: PRIZE POOL */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#F5F1E8]">
                  Prize Pool & Rewards
                </h2>
                <p className="text-xs text-[#A9AAA5] mt-1">
                  Highlight cash rewards, physical swags, and trophies for top builders and teams.
                </p>
              </div>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="hasPrizePool"
                  checked={formData.hasPrizePool}
                  onChange={handleChange}
                  className="w-4 h-4 rounded bg-[#090B0B] border-white/[0.1] text-[#D8B77A] focus:ring-0"
                />
                <span className="text-xs font-semibold text-[#D8B77A] font-mono">
                  Enable Prize Pool
                </span>
              </label>
            </div>

            {formData.hasPrizePool && (
              <div className="space-y-4 animate-fade-in">
                {/* Total Pool */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-[14px] bg-[#0E1110] border border-white/[0.06]">
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-[#A9AAA5] mb-1 font-semibold">
                      Total Prize Pool Amount
                    </label>
                    <input
                      type="text"
                      name="totalPrizePool"
                      value={formData.totalPrizePool}
                      onChange={handleChange}
                      placeholder="e.g. ₹1,00,000 or $5,000"
                      className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#090B0B] border border-white/[0.08] text-xs text-[#D8B77A] font-semibold placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase text-[#A9AAA5] mb-1 font-semibold">
                      Currency
                    </label>
                    <select
                      name="prizeCurrency"
                      value={formData.prizeCurrency}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#090B0B] border border-white/[0.08] text-xs text-[#F5F1E8] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>
                </div>

                {formData.totalPrizePool && (
                  <div className="p-3 rounded-[10px] bg-[#D8B77A]/10 border border-[#D8B77A]/25 text-[#D8B77A] text-xs font-mono font-semibold flex items-center space-x-2">
                    <Trophy className="w-4 h-4 text-[#D8B77A]" />
                    <span>Preview Badge: 🏆 {formData.totalPrizePool} Prize Pool</span>
                  </div>
                )}

                {/* Individual Tier Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-[#A9AAA5] mb-1 font-semibold">
                      🥇 1st Place Winner
                    </label>
                    <input
                      type="text"
                      name="prize1st"
                      value={formData.prize1st}
                      onChange={handleChange}
                      placeholder="e.g. ₹50,000 + Certificate"
                      className="w-full px-3 py-2 rounded-[8px] bg-[#090B0B] border border-white/[0.08] text-xs text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase text-[#A9AAA5] mb-1 font-semibold">
                      🥈 2nd Place Winner
                    </label>
                    <input
                      type="text"
                      name="prize2nd"
                      value={formData.prize2nd}
                      onChange={handleChange}
                      placeholder="e.g. ₹30,000"
                      className="w-full px-3 py-2 rounded-[8px] bg-[#090B0B] border border-white/[0.08] text-xs text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase text-[#A9AAA5] mb-1 font-semibold">
                      🥉 3rd Place Winner
                    </label>
                    <input
                      type="text"
                      name="prize3rd"
                      value={formData.prize3rd}
                      onChange={handleChange}
                      placeholder="e.g. ₹20,000"
                      className="w-full px-3 py-2 rounded-[8px] bg-[#090B0B] border border-white/[0.08] text-xs text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#A9AAA5] mb-1 font-semibold">
                    Special Category / Sponsor Prizes
                  </label>
                  <input
                    type="text"
                    name="prizeSpecial"
                    value={formData.prizeSpecial}
                    onChange={handleChange}
                    placeholder="e.g. Best AI Project: ₹10,000 | Best Beginner Team: $500 Cloud Credits"
                    className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#090B0B] border border-white/[0.08] text-xs text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 7: REAL PREVIEW & PUBLISH */}
        {currentStep === 7 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-[#F5F1E8]">
                Real Opportunity Preview
              </h2>
              <p className="text-xs text-[#A9AAA5] mt-1">
                Inspect how your opportunity will appear to candidates on the public marketplace.
              </p>
            </div>

            {/* High Fidelity Preview Card */}
            <div className="rounded-[16px] bg-[#0E1110] border border-white/[0.12] overflow-hidden shadow-2xl space-y-6">
              {/* Banner Header */}
              {formData.banner ? (
                <div className="aspect-video max-h-60 w-full overflow-hidden bg-black/40">
                  <img
                    src={formData.banner}
                    alt={formData.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-28 bg-gradient-to-r from-[#111615] via-[#151A18] to-[#0E1110] border-b border-white/[0.06]" />
              )}

              {/* Title & Organization Header */}
              <div className="p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 rounded-[12px] bg-[#111615] border border-white/[0.08] flex items-center justify-center font-bold text-[#D8B77A] text-lg overflow-hidden flex-shrink-0">
                      {formData.logo ? (
                        <img src={formData.logo} alt={formData.organization} className="w-full h-full object-cover" />
                      ) : (
                        formData.organization?.slice(0, 2).toUpperCase() || "OP"
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-xs text-[#F5F1E8]">
                          {formData.organization || "Organization Name"}
                        </span>
                        <span className="px-2 py-0.5 rounded-[5px] text-[10px] font-mono text-[#D8B77A] bg-[#D8B77A]/10 border border-[#D8B77A]/20 uppercase">
                          {formData.opportunityType}
                        </span>
                        <span className="px-2 py-0.5 rounded-[5px] text-[10px] font-mono text-[#8FA58E] bg-[#8FA58E]/10 border border-[#8FA58E]/20 uppercase">
                          {formData.mode}
                        </span>
                      </div>

                      <h1 className="text-2xl font-bold text-[#F5F1E8] tracking-tight">
                        {formData.title || "Untitled Opportunity"}
                      </h1>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-[#A9AAA5] font-mono pt-1">
                        <span>📍 {formData.location || "Remote"}</span>
                        <span>•</span>
                        <span>⏳ Deadline: {formData.deadline || "TBD"}</span>
                        {formData.stipend && <span>• 💰 {formData.stipend}</span>}
                        {formData.salary && <span>• 💰 {formData.salary}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="self-start sm:self-center">
                    <button
                      type="button"
                      disabled
                      className="px-5 py-2.5 rounded-[10px] font-semibold text-xs text-[#090B0B] bg-[#D8B77A] opacity-90 cursor-default shadow-sm"
                    >
                      {formData.isExternal ? "Apply on External Site ↗" : "Apply on NIMBLUX"}
                    </button>
                  </div>
                </div>

                {/* Prize Pool Preview Banner */}
                {formData.hasPrizePool && formData.totalPrizePool && (
                  <div className="p-4 rounded-[12px] bg-[#D8B77A]/10 border border-[#D8B77A]/25 flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-[#D8B77A]">
                      <Trophy className="w-5 h-5 flex-shrink-0" />
                      <div>
                        <div className="font-bold text-sm">🏆 {formData.totalPrizePool} Total Prize Pool</div>
                        <div className="text-[11px] text-[#A9AAA5]">
                          {formData.prize1st ? `1st: ${formData.prize1st}` : "Prizes awarded to top participants"}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Description Preview */}
                <div className="space-y-3 pt-4 border-t border-white/[0.06]">
                  <h3 className="font-bold text-sm text-[#F5F1E8]">About Opportunity</h3>
                  <p className="text-xs text-[#A9AAA5] leading-relaxed whitespace-pre-line">
                    {formData.description || "No description provided."}
                  </p>
                </div>

                {/* Skills Tags */}
                {formData.skills && (
                  <div className="space-y-2 pt-2">
                    <h3 className="font-bold text-xs text-[#F5F1E8] uppercase tracking-wider font-mono">
                      Skills & Tech Stack
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {formData.skills.split(",").map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-[6px] text-xs bg-white/[0.04] text-[#F5F1E8] border border-white/[0.08] font-mono"
                        >
                          {s.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Custom Questions Preview */}
                {customQuestions.length > 0 && (
                  <div className="space-y-2 pt-4 border-t border-white/[0.06]">
                    <h3 className="font-bold text-xs text-[#D8B77A] uppercase tracking-wider font-mono">
                      Screening Questions ({customQuestions.length})
                    </h3>
                    <ul className="text-xs text-[#A9AAA5] space-y-1 list-disc pl-5">
                      {customQuestions.map((q) => (
                        <li key={q.id}>
                          {q.label} {q.required && <span className="text-rose-400">*</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Submission Actions Box */}
            <div className="p-6 rounded-[16px] bg-[#0E1110] border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="font-semibold text-xs text-[#F5F1E8]">
                  Ready to publish or save?
                </div>
                <p className="text-[11px] text-[#A9AAA5]">
                  Submitting for review queues the listing for moderator approval. You can also save as a draft.
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => handleSubmit("DRAFT")}
                  disabled={loading}
                  className="px-4 py-2 rounded-[9px] text-xs font-semibold text-[#F5F1E8] bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] disabled:opacity-50 transition-colors flex items-center space-x-1.5"
                >
                  <Save className="w-3.5 h-3.5 text-[#A9AAA5]" />
                  <span>Save Draft</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSubmit("PENDING")}
                  disabled={loading}
                  className="px-6 py-2 rounded-[9px] text-xs font-semibold text-[#090B0B] bg-[#D8B77A] hover:bg-[#E7D5B2] disabled:opacity-50 shadow-sm transition-all flex items-center space-x-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{loading ? "Submitting..." : "Submit for Review"}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step Navigation Footer */}
        <div className="pt-6 border-t border-white/[0.08] flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="flex items-center space-x-2 px-4 py-2 rounded-[9px] text-xs font-semibold text-[#A9AAA5] hover:text-[#F5F1E8] bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 7 && (
            <button
              type="button"
              onClick={nextStep}
              className="flex items-center space-x-2 px-5 py-2 rounded-[9px] text-xs font-semibold text-[#090B0B] bg-[#D8B77A] hover:bg-[#E7D5B2] shadow-sm transition-all"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
