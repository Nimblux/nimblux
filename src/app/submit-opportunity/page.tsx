"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  PlusCircle,
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  Globe,
  Mail,
  Sparkles,
  Info,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Trophy,
  Award,
  Briefcase,
  Code,
  GraduationCap,
  Layers,
  Video,
  Mic2,
  HeartHandshake,
  School,
  Compass,
  Plus,
  Trash2,
  HelpCircle,
  Sliders,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { OPPORTUNITY_TYPES, WORK_MODES, CATEGORIES } from "@/lib/constants";

interface CustomQuestion {
  id: string;
  label: string;
  type: "text" | "textarea" | "select" | "checkbox" | "url";
  options?: string[];
  required: boolean;
  placeholder?: string;
}

export default function SubmitOpportunityPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Selected Opportunity Type (from 16 types)
  const [selectedType, setSelectedType] = useState("INTERNSHIP");

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    category: "internships",
    opportunityType: "INTERNSHIP",
    organization: "",
    logo: "",
    banner: "",
    location: "Remote",
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

  // Custom Screening Questions State
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([]);
  const [newQuestionLabel, setNewQuestionLabel] = useState("");
  const [newQuestionType, setNewQuestionType] = useState<"text" | "textarea" | "select" | "url">("text");
  const [newQuestionRequired, setNewQuestionRequired] = useState(true);
  const [newQuestionOptions, setNewQuestionOptions] = useState("");

  // Verify auth on mount
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (!data.user) {
          router.push("/login?redirect=/submit-opportunity");
        } else {
          setUser(data.user);
        }
      })
      .catch(() => {
        router.push("/login?redirect=/submit-opportunity");
      })
      .finally(() => setCheckingAuth(false));
  }, [router]);

  // Handle Type Change
  const handleTypeSelect = (typeKey: string) => {
    setSelectedType(typeKey);
    const typeMeta = OPPORTUNITY_TYPES.find((t) => t.type === typeKey);
    const categorySlug = typeMeta ? typeMeta.categorySlug : "other";

    setFormData((prev) => ({
      ...prev,
      opportunityType: typeKey,
      category: categorySlug,
      hasPrizePool: typeKey === "COMPETITION" || typeKey === "HACKATHON" || typeKey === "CHALLENGE" ? true : prev.hasPrizePool,
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Add Custom Question Handler
  const handleAddQuestion = () => {
    if (!newQuestionLabel.trim()) return;

    const optionsArray = newQuestionType === "select" && newQuestionOptions.trim()
      ? newQuestionOptions.split(",").map((s) => s.trim()).filter(Boolean)
      : undefined;

    const newQ: CustomQuestion = {
      id: `q_${Date.now()}`,
      label: newQuestionLabel.trim(),
      type: newQuestionType,
      options: optionsArray,
      required: newQuestionRequired,
    };

    setCustomQuestions((prev) => [...prev, newQ]);
    setNewQuestionLabel("");
    setNewQuestionOptions("");
    setNewQuestionType("text");
    setNewQuestionRequired(true);
  };

  const handleRemoveQuestion = (id: string) => {
    setCustomQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        ...formData,
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

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard/submissions");
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

  const currentTypeMeta = OPPORTUNITY_TYPES.find((t) => t.type === selectedType) || OPPORTUNITY_TYPES[0];

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      {/* Top Banner Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
          <div>
            <h1 className="text-2xl sm:text-3xl font-[700] text-[#F5F1E8] tracking-tight">
              Create an Opportunity
            </h1>
            <p className="text-xs sm:text-sm text-[#A9AAA5] mt-1">
              Publish internships, jobs, hackathons, workshops, events and more directly on NIMBLUX.
            </p>
          </div>
          <Link
            href="/organizer"
            className="self-start sm:self-center px-3.5 py-1.5 rounded-[8px] text-xs font-medium text-[#F5F1E8] bg-[#151A18] border border-white/[0.08] hover:border-white/[0.15] transition-colors"
          >
            Organizer Console →
          </Link>
        </div>

        {/* Step Indicator */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
          {[
            { num: "1", name: "Basic Information" },
            { num: "2", name: "Details" },
            { num: "3", name: "Participation" },
            { num: "4", name: "Review" },
            { num: "5", name: "Submit" },
          ].map((step, idx) => (
            <div
              key={step.num}
              className="p-3 rounded-[10px] bg-[#111615] border border-white/[0.08] flex items-center space-x-2.5"
            >
              <div className="w-5 h-5 rounded-full bg-[#D8B77A] text-[#090B0B] flex items-center justify-center font-bold text-[11px] font-mono">
                {step.num}
              </div>
              <span className="text-[12px] font-medium text-[#F5F1E8] truncate">
                {step.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Moderation Workflow Notice */}
      <div className="p-4 rounded-2xl bg-charcoal-card border border-bronze-500/30 flex items-start space-x-3.5 shadow-card">
        <Info className="w-4.5 h-4.5 text-bronze-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-ivory-400 leading-relaxed">
          <span className="font-bold text-bronze-300">Moderation Guarantee:</span> Newly posted opportunities enter the{" "}
          <strong className="text-ivory-100 font-mono">Under Review</strong> queue and are reviewed by moderators within 24 hours to ensure high-quality, verified listings. You can track status and manage candidates in your Organizer Suite.
        </div>
      </div>

      {/* STEP 1: SELECT OPPORTUNITY TYPE */}
      <div className="rounded-3xl bg-charcoal-card p-6 sm:p-8 border border-charcoal-cardBorder shadow-card space-y-5">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-wider text-bronze-400 font-bold mb-1">
            Step 1 of 4
          </div>
          <h2 className="font-serif-heading font-medium text-xl sm:text-2xl text-ivory-100">
            What are you creating?
          </h2>
          <p className="text-xs text-ivory-500">
            Select the opportunity type to dynamically configure the appropriate workflow fields.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {OPPORTUNITY_TYPES.map((t) => {
            const isSelected = selectedType === t.type;
            return (
              <button
                key={t.type}
                type="button"
                onClick={() => handleTypeSelect(t.type)}
                className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 ${
                  isSelected
                    ? "bg-bronze-500/15 border-bronze-500 text-ivory-100 shadow-editorial"
                    : "bg-charcoal-900/60 border-charcoal-cardBorder text-ivory-400 hover:text-ivory-200 hover:border-charcoal-800"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg">
                    {t.type === "INTERNSHIP" && "💼"}
                    {t.type === "JOB" && "🏢"}
                    {t.type === "HACKATHON" && "⚡"}
                    {t.type === "WORKSHOP" && "🛠️"}
                    {t.type === "COMPETITION" && "🏆"}
                    {t.type === "EVENT" && "📅"}
                    {t.type === "SCHOLARSHIP" && "🎓"}
                    {t.type === "FELLOWSHIP" && "🌟"}
                    {t.type === "COURSE" && "📚"}
                    {t.type === "BOOTCAMP" && "🚀"}
                    {t.type === "WEBINAR" && "🎥"}
                    {t.type === "CONFERENCE" && "🎤"}
                    {t.type === "CHALLENGE" && "🧩"}
                    {t.type === "VOLUNTEERING" && "🤝"}
                    {t.type === "CAMPUS" && "🏫"}
                    {t.type === "OTHER" && "🧭"}
                  </span>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-bronze-400" />
                  )}
                </div>
                <div>
                  <div className="font-bold text-xs text-ivory-100 leading-tight">
                    {t.name}
                  </div>
                  <div className="text-[10px] text-ivory-500 font-mono mt-0.5">
                    {t.modeLabel === "application" ? "Application flow" : "Registration flow"}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN FORM */}
      <div className="rounded-3xl bg-charcoal-card p-6 sm:p-10 border border-charcoal-cardBorder shadow-2xl">
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="text-center py-12 space-y-4 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-forest-500/20 text-forest-300 flex items-center justify-center mx-auto border border-forest-500/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="font-serif-heading font-medium text-2xl text-ivory-100">
              Opportunity Submitted for Moderation
            </h2>
            <p className="text-xs sm:text-sm text-ivory-400 max-w-md mx-auto leading-relaxed">
              Your {currentTypeMeta.name.toLowerCase()} listing has been submitted and queued for review. Redirecting to your submissions dashboard...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-10">
            {/* SECTION 1: BASIC INFORMATION */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-ivory-100 pb-2 border-b border-charcoal-cardBorder flex items-center space-x-2 font-mono uppercase tracking-wider">
                <span className="w-5 h-5 rounded-full bg-bronze-500 text-charcoal-950 flex items-center justify-center text-[10px] font-bold">
                  2
                </span>
                <span>Basic Overview & Organization</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-ivory-300 block mb-1 font-mono">
                    Opportunity Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    placeholder={
                      selectedType === "INTERNSHIP"
                        ? "e.g. Summer Software Engineering Internship 2026"
                        : selectedType === "JOB"
                        ? "e.g. Junior Full-Stack Developer (New Grad)"
                        : selectedType === "WORKSHOP"
                        ? "e.g. Full-Stack AI & LLM Agent Architecture Masterclass"
                        : selectedType === "SCHOLARSHIP"
                        ? "e.g. Women in Tech Undergraduate Excellence Grant"
                        : "e.g. Global Innovation Challenge 2026"
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-xs text-ivory-100 placeholder-ivory-500 focus:outline-none focus:border-bronze-500/50"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-ivory-300 block mb-1 font-mono">
                    Organization / Company Name *
                  </label>
                  <input
                    type="text"
                    name="organization"
                    required
                    value={formData.organization}
                    onChange={handleChange}
                    placeholder="e.g. Google, Microsoft, MIT, OpenAI, NIMBLUX"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-xs text-ivory-100 placeholder-ivory-500 focus:outline-none focus:border-bronze-500/50"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-ivory-300 block mb-1 font-mono">
                    Work / Event Mode *
                  </label>
                  <select
                    name="mode"
                    required
                    value={formData.mode}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-xs text-ivory-100 focus:outline-none focus:border-bronze-500/50 cursor-pointer"
                  >
                    {WORK_MODES.map((m) => (
                      <option key={m.value} value={m.value} className="bg-charcoal-900">
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-ivory-300 block mb-1 font-mono">
                    Location / Venue
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. San Francisco, CA / Bengaluru / Remote"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-xs text-ivory-100 placeholder-ivory-500 focus:outline-none focus:border-bronze-500/50"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-ivory-300 block mb-1 font-mono">
                    Application / Registration Deadline *
                  </label>
                  <input
                    type="date"
                    name="deadline"
                    required
                    value={formData.deadline}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-xs text-ivory-100 focus:outline-none focus:border-bronze-500/50"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: IN-PLATFORM VS EXTERNAL PARTICIPATION */}
            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-bold text-ivory-100 pb-2 border-b border-charcoal-cardBorder flex items-center space-x-2 font-mono uppercase tracking-wider">
                <span className="w-5 h-5 rounded-full bg-bronze-500 text-charcoal-950 flex items-center justify-center text-[10px] font-bold">
                  3
                </span>
                <span>Participation Mode & Registration Engine</span>
              </h3>

              {/* Toggle Box */}
              <div className="p-5 rounded-2xl bg-charcoal-900 border border-charcoal-cardBorder space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-bronze-500/15 text-bronze-300 flex items-center justify-center">
                      <Sparkles className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-ivory-100">
                        Native In-Platform Participation (Recommended)
                      </div>
                      <div className="text-[11px] text-ivory-500 leading-snug">
                        {formData.isExternal
                          ? "External registration enabled. Candidates will be directed to your link."
                          : "Candidates will apply/register directly on NIMBLUX. No external portal required."}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-mono text-ivory-400">
                      {formData.isExternal ? "External Link" : "Native NIMBLUX"}
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="isExternal"
                        checked={formData.isExternal}
                        onChange={handleChange}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-charcoal-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-ivory-100 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                    </label>
                  </div>
                </div>

                {formData.isExternal && (
                  <div className="pt-3 border-t border-charcoal-cardBorder space-y-2 animate-fade-in">
                    <label className="text-xs font-semibold text-amber-300 block font-mono">
                      External Application / Registration URL *
                    </label>
                    <input
                      type="url"
                      name="externalUrl"
                      required={formData.isExternal}
                      value={formData.externalUrl}
                      onChange={handleChange}
                      placeholder="https://yourcompany.com/careers/apply-here"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-950 border border-amber-500/40 text-xs text-ivory-100 placeholder-ivory-500 focus:outline-none font-mono"
                    />
                    <p className="text-[11px] text-ivory-500">
                      A clear "Apply on Official Website" button will redirect candidates to this external link.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* SECTION 3: TYPE-SPECIALIZED FIELDS */}
            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-bold text-ivory-100 pb-2 border-b border-charcoal-cardBorder flex items-center space-x-2 font-mono uppercase tracking-wider">
                <span className="w-5 h-5 rounded-full bg-bronze-500 text-charcoal-950 flex items-center justify-center text-[10px] font-bold">
                  4
                </span>
                <span>Specialized {currentTypeMeta.name} Details</span>
              </h3>

              {/* Dynamic specialized field rendering */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Internships & Jobs */}
                {(selectedType === "INTERNSHIP" || selectedType === "JOB") && (
                  <>
                    <div>
                      <label className="text-xs font-semibold text-ivory-300 block mb-1 font-mono">
                        {selectedType === "INTERNSHIP" ? "Monthly Stipend" : "Annual Salary Range"}
                      </label>
                      <input
                        type="text"
                        name={selectedType === "INTERNSHIP" ? "stipend" : "salary"}
                        value={selectedType === "INTERNSHIP" ? formData.stipend : formData.salary}
                        onChange={handleChange}
                        placeholder={selectedType === "INTERNSHIP" ? "e.g. $8,000 / month or ₹50,000 / month" : "e.g. $120,000 - $145,000 / year"}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-xs text-ivory-100 placeholder-ivory-500 focus:outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-ivory-300 block mb-1 font-mono">
                        {selectedType === "INTERNSHIP" ? "Internship Duration" : "Department / Team"}
                      </label>
                      <input
                        type="text"
                        name={selectedType === "INTERNSHIP" ? "duration" : "department"}
                        value={selectedType === "INTERNSHIP" ? formData.duration : formData.department}
                        onChange={handleChange}
                        placeholder={selectedType === "INTERNSHIP" ? "e.g. 10 - 12 Weeks (Summer 2026)" : "e.g. Core Infrastructure / AI Platform"}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-xs text-ivory-100 placeholder-ivory-500 focus:outline-none"
                      />
                    </div>
                  </>
                )}

                {/* Workshops, Events & Webinars */}
                {(selectedType === "WORKSHOP" || selectedType === "EVENT" || selectedType === "WEBINAR" || selectedType === "CONFERENCE") && (
                  <>
                    <div>
                      <label className="text-xs font-semibold text-ivory-300 block mb-1 font-mono">
                        Instructor / Keynote Speaker
                      </label>
                      <input
                        type="text"
                        name="instructor"
                        value={formData.instructor}
                        onChange={handleChange}
                        placeholder="e.g. Dr. Alex Morgan (Principal AI Engineer)"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-xs text-ivory-100 placeholder-ivory-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-ivory-300 block mb-1 font-mono">
                        Participant Capacity (Optional)
                      </label>
                      <input
                        type="number"
                        name="capacity"
                        value={formData.capacity}
                        onChange={handleChange}
                        placeholder="e.g. 250 (Leave blank for unlimited)"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-xs text-ivory-100 placeholder-ivory-500 focus:outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-ivory-300 block mb-1 font-mono">
                        Ticket / Registration Price
                      </label>
                      <input
                        type="text"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        placeholder="Free (or e.g. ₹499 / $10)"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-xs text-ivory-100 placeholder-ivory-500 focus:outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-ivory-300 block mb-1 font-mono">
                        Online Meeting URL (Zoom / Google Meet / Discord)
                      </label>
                      <input
                        type="url"
                        name="meetingUrl"
                        value={formData.meetingUrl}
                        onChange={handleChange}
                        placeholder="https://meet.google.com/... (Visible to registered users)"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-xs text-ivory-100 placeholder-ivory-500 focus:outline-none font-mono"
                      />
                    </div>
                  </>
                )}

                {/* Scholarships & Fellowships */}
                {(selectedType === "SCHOLARSHIP" || selectedType === "FELLOWSHIP") && (
                  <>
                    <div>
                      <label className="text-xs font-semibold text-ivory-300 block mb-1 font-mono">
                        Grant / Scholarship Award Amount
                      </label>
                      <input
                        type="text"
                        name="stipend"
                        value={formData.stipend}
                        onChange={handleChange}
                        placeholder="e.g. $10,000 USD or ₹2,00,000"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-xs text-ivory-100 placeholder-ivory-500 focus:outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-ivory-300 block mb-1 font-mono">
                        Eligible Degree / Education Level
                      </label>
                      <input
                        type="text"
                        name="eligibility"
                        value={formData.eligibility}
                        onChange={handleChange}
                        placeholder="e.g. Undergraduate students in Computer Science"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-xs text-ivory-100 placeholder-ivory-500 focus:outline-none"
                      />
                    </div>
                  </>
                )}

                {/* Courses & Bootcamps */}
                {(selectedType === "COURSE" || selectedType === "BOOTCAMP") && (
                  <>
                    <div>
                      <label className="text-xs font-semibold text-ivory-300 block mb-1 font-mono">
                        Course Instructor
                      </label>
                      <input
                        type="text"
                        name="instructor"
                        value={formData.instructor}
                        onChange={handleChange}
                        placeholder="e.g. Andrew Ng / NIMBLUX Lab"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-xs text-ivory-100 placeholder-ivory-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-ivory-300 block mb-1 font-mono">
                        Cohort Duration
                      </label>
                      <input
                        type="text"
                        name="duration"
                        value={formData.duration}
                        onChange={handleChange}
                        placeholder="e.g. 8 Weeks (Self-Paced + Live Labs)"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-xs text-ivory-100 placeholder-ivory-500 focus:outline-none font-mono"
                      />
                    </div>
                  </>
                )}

                {/* Common Schedule */}
                <div>
                  <label className="text-xs font-semibold text-ivory-300 block mb-1 font-mono">
                    Start Date (Optional)
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-xs text-ivory-100 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-ivory-300 block mb-1 font-mono">
                    Required Skills (Comma separated)
                  </label>
                  <input
                    type="text"
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    placeholder="e.g. Python, React, TypeScript, AI, AWS"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-xs text-ivory-100 placeholder-ivory-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-ivory-300 block mb-1 font-mono">
                    Full Description *
                  </label>
                  <textarea
                    rows={5}
                    name="description"
                    required
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Provide full details about project scope, responsibilities, prerequisites, syllabus, or perks..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-xs text-ivory-100 placeholder-ivory-500 focus:outline-none resize-y"
                  />
                </div>
              </div>

              {/* REUSABLE PRIZE POOL BUILDER (For Hackathons, Competitions, Challenges) */}
              <div className="pt-4 border-t border-charcoal-cardBorder">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-charcoal-900 border border-charcoal-cardBorder">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
                      <Trophy className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-ivory-100">Prize Pool & Rewards</div>
                      <div className="text-[11px] text-ivory-500">Enable if cash prizes, bounties, or physical awards are offered</div>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="hasPrizePool"
                      checked={formData.hasPrizePool}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-charcoal-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-ivory-100 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>

                {formData.hasPrizePool && (
                  <div className="mt-4 p-5 rounded-2xl bg-charcoal-900/60 border border-amber-500/30 space-y-4 animate-fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-ivory-300 block mb-1 font-mono">
                          Currency
                        </label>
                        <select
                          name="prizeCurrency"
                          value={formData.prizeCurrency}
                          onChange={handleChange}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-xs text-ivory-100 focus:outline-none cursor-pointer"
                        >
                          <option value="INR">INR (₹)</option>
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                          <option value="GBP">GBP (£)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-ivory-300 block mb-1 font-mono">
                          Total Prize Pool (e.g. 50,000 or 1,00,000)
                        </label>
                        <input
                          type="text"
                          name="totalPrizePool"
                          value={formData.totalPrizePool}
                          onChange={handleChange}
                          placeholder="e.g. 50,000"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-xs text-ivory-100 font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      <div>
                        <label className="text-[11px] font-semibold text-amber-400 block mb-1 font-mono">
                          🥇 1st Prize
                        </label>
                        <input
                          type="text"
                          name="prize1st"
                          value={formData.prize1st}
                          onChange={handleChange}
                          placeholder="e.g. ₹25,000"
                          className="w-full px-3 py-2 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-xs text-ivory-100 font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-stone-300 block mb-1 font-mono">
                          🥈 2nd Prize
                        </label>
                        <input
                          type="text"
                          name="prize2nd"
                          value={formData.prize2nd}
                          onChange={handleChange}
                          placeholder="e.g. ₹15,000"
                          className="w-full px-3 py-2 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-xs text-ivory-100 font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-bronze-400 block mb-1 font-mono">
                          🥉 3rd Prize
                        </label>
                        <input
                          type="text"
                          name="prize3rd"
                          value={formData.prize3rd}
                          onChange={handleChange}
                          placeholder="e.g. ₹10,000"
                          className="w-full px-3 py-2 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-xs text-ivory-100 font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="text-xs font-semibold text-ivory-300 block mb-1 font-mono">
                          🏅 Special Category Prizes
                        </label>
                        <input
                          type="text"
                          name="prizeSpecial"
                          value={formData.prizeSpecial}
                          onChange={handleChange}
                          placeholder="e.g. Best UI/UX: ₹5,000, Best AI: ₹5,000"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-xs text-ivory-100"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-ivory-300 block mb-1 font-mono">
                          Additional Goodies / Swag
                        </label>
                        <input
                          type="text"
                          name="prizeDetails"
                          value={formData.prizeDetails}
                          onChange={handleChange}
                          placeholder="e.g. Certificates + T-Shirts + Cloud Credits"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-xs text-ivory-100"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* SECTION 4: CUSTOM SCREENING & REGISTRATION QUESTIONS BUILDER */}
            {!formData.isExternal && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between pb-2 border-b border-charcoal-cardBorder">
                  <h3 className="text-sm font-bold text-ivory-100 flex items-center space-x-2 font-mono uppercase tracking-wider">
                    <span className="w-5 h-5 rounded-full bg-bronze-500 text-charcoal-950 flex items-center justify-center text-[10px] font-bold">
                      5
                    </span>
                    <span>Custom Screening Questions Builder</span>
                  </h3>
                  <span className="text-[11px] font-mono text-bronze-300">
                    {customQuestions.length} {customQuestions.length === 1 ? "question" : "questions"} configured
                  </span>
                </div>

                <p className="text-xs text-ivory-400">
                  Ask custom questions to candidates or attendees during in-platform application/registration.
                </p>

                {/* Question List */}
                {customQuestions.length > 0 && (
                  <div className="space-y-2">
                    {customQuestions.map((q, idx) => (
                      <div
                        key={q.id}
                        className="p-3.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-bold text-ivory-100">
                            {idx + 1}. {q.label}
                          </span>
                          <div className="text-[10.5px] font-mono text-ivory-500 mt-0.5">
                            Type: <strong className="text-ivory-300">{q.type}</strong> • {q.required ? "Required" : "Optional"}
                            {q.options && ` • Options: ${q.options.join(", ")}`}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveQuestion(q.id)}
                          className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Remove question"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add New Question Row */}
                <div className="p-4 rounded-2xl bg-charcoal-900/70 border border-charcoal-cardBorder space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-semibold text-ivory-300 block mb-1 font-mono">
                        Question Label / Prompt
                      </label>
                      <input
                        type="text"
                        value={newQuestionLabel}
                        onChange={(e) => setNewQuestionLabel(e.target.value)}
                        placeholder="e.g. Why are you interested in this position?"
                        className="w-full px-3 py-2 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-xs text-ivory-100 focus:outline-none focus:border-bronze-500/50"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-ivory-300 block mb-1 font-mono">
                        Response Type
                      </label>
                      <select
                        value={newQuestionType}
                        onChange={(e) => setNewQuestionType(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-xs text-ivory-100 focus:outline-none cursor-pointer"
                      >
                        <option value="text">Short Text</option>
                        <option value="textarea">Paragraph / Essay</option>
                        <option value="select">Dropdown / Multiple Choice</option>
                        <option value="url">URL / File Link</option>
                      </select>
                    </div>
                  </div>

                  {newQuestionType === "select" && (
                    <div>
                      <label className="text-[11px] font-semibold text-ivory-300 block mb-1 font-mono">
                        Dropdown Options (Comma separated)
                      </label>
                      <input
                        type="text"
                        value={newQuestionOptions}
                        onChange={(e) => setNewQuestionOptions(e.target.value)}
                        placeholder="e.g. Beginner, Intermediate, Advanced"
                        className="w-full px-3 py-2 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-xs text-ivory-100 font-mono"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center space-x-2 text-xs text-ivory-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newQuestionRequired}
                        onChange={(e) => setNewQuestionRequired(e.target.checked)}
                        className="rounded"
                      />
                      <span>Mark as mandatory / required</span>
                    </label>

                    <button
                      type="button"
                      onClick={handleAddQuestion}
                      className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-charcoal-950 bg-bronze-500 hover:bg-bronze-400 shadow-button transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Question</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* FORM CONTROLS */}
            <div className="pt-6 border-t border-charcoal-cardBorder flex items-center justify-between">
              <Link
                href="/opportunities"
                className="text-xs font-semibold text-ivory-500 hover:text-ivory-200 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center space-x-2 px-8 py-3 rounded-2xl font-bold text-xs sm:text-sm text-charcoal-950 bg-bronze-500 hover:bg-bronze-400 shadow-button disabled:opacity-50 transition-all"
              >
                <span>{loading ? "Submitting Listing..." : "Submit for Moderation"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
