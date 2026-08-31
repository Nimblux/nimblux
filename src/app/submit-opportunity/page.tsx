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
  Eye,
  Trophy,
  Award,
} from "lucide-react";
import { CATEGORIES, WORK_MODES } from "@/lib/constants";
import OpportunityCard from "@/components/cards/OpportunityCard";

export default function SubmitOpportunityPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    category: "internships",
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
    hasPrizePool: false,
    totalPrizePool: "",
    prizeCurrency: "INR",
    prize1st: "",
    prize2nd: "",
    prize3rd: "",
    prizeSpecial: "",
    prizeDetails: "",
    applicationUrl: "",
    deadline: "",
    startDate: "",
    endDate: "",
    contactInfo: "",
    additionalInfo: "",
    description: "",
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
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

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Top Banner Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-bronze-500/10 border border-bronze-500/20 text-bronze-300 text-xs font-mono mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Community Submissions</span>
        </div>
        <h1 className="font-serif-heading font-medium text-3xl sm:text-4xl text-ivory-100">
          Post an Opportunity on NIMBLUX
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-ivory-400 max-w-lg mx-auto">
          Share verified internships, hackathons, jobs, grants, or events with thousands of ambitious students.
        </p>
      </div>

      {/* Moderation Workflow Notice */}
      <div className="mb-8 p-4 rounded-2xl bg-charcoal-card border border-bronze-500/30 flex items-start space-x-3.5 shadow-card">
        <Info className="w-4.5 h-4.5 text-bronze-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-ivory-400 leading-relaxed">
          <span className="font-bold text-bronze-300">Moderation Workflow:</span> All submitted listings enter an{" "}
          <strong className="text-ivory-100 font-mono">Under Review</strong> state and are verified by NIMBLUX moderators within 24 hours to prevent spam and dead links. You can monitor the real-time status in your Student Dashboard.
        </div>
      </div>

      {/* Main Form Container */}
      <div className="rounded-3xl bg-charcoal-card p-6 sm:p-10 border border-charcoal-cardBorder shadow-2xl">
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="text-center py-12 space-y-4">
            <div className="w-16 h-16 rounded-full bg-forest-500/20 text-forest-300 flex items-center justify-center mx-auto border border-forest-500/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="font-serif-heading font-medium text-2xl text-ivory-100">
              Opportunity Submitted Successfully
            </h2>
            <p className="text-xs sm:text-sm text-ivory-400 max-w-md mx-auto">
              Your submission is now in the moderation queue. Redirecting you to your submissions dashboard...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section 1: Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-ivory-100 pb-2 border-b border-charcoal-cardBorder flex items-center space-x-2 font-mono uppercase tracking-wider">
                <span className="w-5 h-5 rounded-full bg-bronze-500 text-charcoal-950 flex items-center justify-center text-[10px] font-bold">
                  1
                </span>
                <span>Basic Information</span>
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
                    placeholder="e.g. Summer Software Engineering Internship 2026"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-xs text-ivory-100 placeholder-ivory-500 focus:outline-none focus:border-bronze-500/50"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-ivory-300 block mb-1 font-mono">
                    Category *
                  </label>
                  <select
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-xs text-ivory-100 focus:outline-none focus:border-bronze-500/50 cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.slug} value={cat.slug} className="bg-charcoal-900">
                        {cat.name}
                      </option>
                    ))}
                  </select>
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
                    placeholder="e.g. Google, Microsoft, MIT, OpenAI"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-xs text-ivory-100 placeholder-ivory-500 focus:outline-none focus:border-bronze-500/50"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-ivory-300 block mb-1 font-mono">
                    Work Mode *
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
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. San Francisco, CA / Remote / Worldwide"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-xs text-ivory-100 placeholder-ivory-500 focus:outline-none focus:border-bronze-500/50"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Compensation & Application Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-ivory-100 pb-2 border-b border-charcoal-cardBorder flex items-center space-x-2 font-mono uppercase tracking-wider">
                <span className="w-5 h-5 rounded-full bg-bronze-500 text-charcoal-950 flex items-center justify-center text-[10px] font-bold">
                  2
                </span>
                <span>Compensation & Application Links</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-ivory-300 block mb-1 font-mono">
                    Official Application / Website URL *
                  </label>
                  <input
                    type="url"
                    name="applicationUrl"
                    required
                    value={formData.applicationUrl}
                    onChange={handleChange}
                    placeholder="https://company.com/careers/apply-now"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-xs text-ivory-100 placeholder-ivory-500 focus:outline-none focus:border-bronze-500/50"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-ivory-300 block mb-1 font-mono">
                    Stipend (for Internships / Hackathons)
                  </label>
                  <input
                    type="text"
                    name="stipend"
                    value={formData.stipend}
                    onChange={handleChange}
                    placeholder="e.g. $8,000 / month or $50k Prize Pool"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-xs text-ivory-100 placeholder-ivory-500 focus:outline-none focus:border-bronze-500/50"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-ivory-300 block mb-1 font-mono">
                    Annual Salary (for Full-time Jobs)
                  </label>
                  <input
                    type="text"
                    name="salary"
                    value={formData.salary}
                    onChange={handleChange}
                    placeholder="e.g. $120,000 - $145,000 / year"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-xs text-ivory-100 placeholder-ivory-500 focus:outline-none focus:border-bronze-500/50"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-ivory-300 block mb-1 font-mono">
                    Registration Fee
                  </label>
                  <input
                    type="text"
                    name="registrationFee"
                    value={formData.registrationFee}
                    onChange={handleChange}
                    placeholder="Free"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-xs text-ivory-100 placeholder-ivory-500 focus:outline-none focus:border-bronze-500/50"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-ivory-300 block mb-1 font-mono">
                    Application Deadline *
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

              {/* Reusable Prize Pool Management Toggle */}
              <div className="pt-4 border-t border-charcoal-cardBorder">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-charcoal-900 border border-charcoal-cardBorder">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
                      <Trophy className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-ivory-100">Prize Pool & Rewards</div>
                      <div className="text-[11px] text-ivory-500">Enable if this opportunity or competition offers cash prizes or awards</div>
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
                          className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-xs text-ivory-100 focus:outline-none focus:border-bronze-500/50 cursor-pointer"
                        >
                          <option value="INR">INR (₹)</option>
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                          <option value="GBP">GBP (£)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-ivory-300 block mb-1 font-mono">
                          Total Prize Pool (e.g. 50000 or 1,00,000)
                        </label>
                        <input
                          type="text"
                          name="totalPrizePool"
                          value={formData.totalPrizePool}
                          onChange={handleChange}
                          placeholder="e.g. 50,000"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-xs text-ivory-100 placeholder-ivory-500 focus:outline-none focus:border-bronze-500/50 font-mono"
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
                          className="w-full px-3 py-2 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-xs text-ivory-100 placeholder-ivory-500 focus:outline-none focus:border-bronze-500/50 font-mono"
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
                          className="w-full px-3 py-2 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-xs text-ivory-100 placeholder-ivory-500 focus:outline-none focus:border-bronze-500/50 font-mono"
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
                          className="w-full px-3 py-2 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-xs text-ivory-100 placeholder-ivory-500 focus:outline-none focus:border-bronze-500/50 font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="text-xs font-semibold text-ivory-300 block mb-1 font-mono">
                          🏅 Special Awards / Category Prizes (Optional)
                        </label>
                        <input
                          type="text"
                          name="prizeSpecial"
                          value={formData.prizeSpecial}
                          onChange={handleChange}
                          placeholder="e.g. Best UI/UX: ₹5,000, Best AI: ₹5,000"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-xs text-ivory-100 placeholder-ivory-500 focus:outline-none focus:border-bronze-500/50"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-ivory-300 block mb-1 font-mono">
                          Additional Benefits / Goodies (Optional)
                        </label>
                        <input
                          type="text"
                          name="prizeDetails"
                          value={formData.prizeDetails}
                          onChange={handleChange}
                          placeholder="e.g. Certificates + T-shirts + Cloud Credits"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-xs text-ivory-100 placeholder-ivory-500 focus:outline-none focus:border-bronze-500/50"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Section 3: Requirements & Full Description */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-ivory-100 pb-2 border-b border-charcoal-cardBorder flex items-center space-x-2 font-mono uppercase tracking-wider">
                <span className="w-5 h-5 rounded-full bg-bronze-500 text-charcoal-950 flex items-center justify-center text-[10px] font-bold">
                  3
                </span>
                <span>Requirements & Description</span>
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-ivory-300 block mb-1 font-mono">
                    Eligibility Criteria
                  </label>
                  <input
                    type="text"
                    name="eligibility"
                    value={formData.eligibility}
                    onChange={handleChange}
                    placeholder="e.g. Undergrads graduating in 2026/2027 in CS or related technical fields."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-xs text-ivory-100 placeholder-ivory-500 focus:outline-none focus:border-bronze-500/50"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-ivory-300 block mb-1 font-mono">
                    Skills Required (Comma separated)
                  </label>
                  <input
                    type="text"
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    placeholder="e.g. Python, React, TypeScript, Machine Learning, AWS"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-xs text-ivory-100 placeholder-ivory-500 focus:outline-none focus:border-bronze-500/50"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-ivory-300 block mb-1 font-mono">
                    Full Description *
                  </label>
                  <textarea
                    rows={5}
                    name="description"
                    required
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Provide detailed information about the role, project scope, team overview, perks, and how to prepare..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-xs text-ivory-100 placeholder-ivory-500 focus:outline-none focus:border-bronze-500/50 resize-y"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-ivory-300 block mb-1 font-mono">
                      Logo Image URL (Optional)
                    </label>
                    <input
                      type="url"
                      name="logo"
                      value={formData.logo}
                      onChange={handleChange}
                      placeholder="https://example.com/logo.png"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-xs text-ivory-100 placeholder-ivory-500 focus:outline-none focus:border-bronze-500/50"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-ivory-300 block mb-1 font-mono">
                      Contact Email (Optional)
                    </label>
                    <input
                      type="email"
                      name="contactInfo"
                      value={formData.contactInfo}
                      onChange={handleChange}
                      placeholder="recruiting@company.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-xs text-ivory-100 placeholder-ivory-500 focus:outline-none focus:border-bronze-500/50"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Form Controls */}
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
                className="flex items-center space-x-2 px-7 py-3 rounded-xl font-bold text-xs text-charcoal-950 bg-bronze-500 hover:bg-bronze-400 shadow-button disabled:opacity-50 transition-all"
              >
                <span>{loading ? "Submitting..." : "Submit for Moderation"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
