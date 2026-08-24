"use client";

import React, { useEffect, useState } from "react";
import { User, Save, CheckCircle2, Github, Linkedin, MapPin, GraduationCap, Sparkles } from "lucide-react";

export default function ProfilePage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    college: "",
    degree: "",
    skills: "",
    graduationYear: "",
    location: "",
    bio: "",
    githubUrl: "",
    linkedinUrl: "",
    profileImage: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/users/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setFormData({
            name: data.user.name || "",
            email: data.user.email || "",
            college: data.user.college || "",
            degree: data.user.degree || "",
            skills: data.user.skills || "",
            graduationYear: data.user.graduationYear || "2026",
            location: data.user.location || "",
            bio: data.user.bio || "",
            githubUrl: data.user.githubUrl || "",
            linkedinUrl: data.user.linkedinUrl || "",
            profileImage: data.user.profileImage || "",
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setMessage("Profile updated successfully!");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (e) {
      alert("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-ivory-500 text-xs animate-pulse">Loading profile...</div>;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="font-serif-heading font-medium text-xl sm:text-2xl text-ivory-100">
          Student Profile
        </h2>
        <p className="text-xs text-ivory-500 mt-0.5">
          Manage your education, technical competencies, and professional links.
        </p>
      </div>

      <div className="rounded-3xl bg-charcoal-card p-6 sm:p-8 border border-charcoal-cardBorder shadow-card">
        {message && (
          <div className="mb-6 p-3 rounded-2xl bg-forest-500/10 border border-forest-500/30 text-forest-300 text-xs flex items-center space-x-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-forest-400 flex-shrink-0" />
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          {/* Avatar URL */}
          <div className="flex items-center space-x-4 pb-6 border-b border-charcoal-cardBorder">
            <div className="w-16 h-16 rounded-2xl bg-charcoal-900 border border-charcoal-cardBorder flex items-center justify-center text-lg font-bold text-bronze-300 font-mono overflow-hidden flex-shrink-0">
              {formData.profileImage ? (
                <img
                  src={formData.profileImage}
                  alt={formData.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                formData.name.charAt(0)
              )}
            </div>
            <div className="flex-1">
              <label className="font-semibold text-ivory-300 block mb-1 font-mono">
                Profile Photo URL
              </label>
              <input
                type="url"
                name="profileImage"
                value={formData.profileImage}
                onChange={handleChange}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3.5 py-2 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 placeholder-ivory-500 focus:outline-none focus:border-bronze-500/50"
              />
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-ivory-300 block mb-1 font-mono">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50"
              />
            </div>

            <div>
              <label className="font-semibold text-ivory-300 block mb-1 font-mono">
                Email Address (Account ID)
              </label>
              <input
                type="email"
                disabled
                value={formData.email}
                className="w-full px-3.5 py-2 rounded-xl bg-charcoal-950 border border-charcoal-cardBorder text-ivory-500 cursor-not-allowed font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-ivory-300 block mb-1 font-mono">
                College / University
              </label>
              <input
                type="text"
                name="college"
                value={formData.college}
                onChange={handleChange}
                placeholder="Stanford University, IIT Bombay, MIT..."
                className="w-full px-3.5 py-2 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 placeholder-ivory-500 focus:outline-none focus:border-bronze-500/50"
              />
            </div>

            <div>
              <label className="font-semibold text-ivory-300 block mb-1 font-mono">
                Degree & Major
              </label>
              <input
                type="text"
                name="degree"
                value={formData.degree}
                onChange={handleChange}
                placeholder="B.S. Computer Science & AI"
                className="w-full px-3.5 py-2 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 placeholder-ivory-500 focus:outline-none focus:border-bronze-500/50"
              />
            </div>

            <div>
              <label className="font-semibold text-ivory-300 block mb-1 font-mono">
                Graduation Year
              </label>
              <select
                name="graduationYear"
                value={formData.graduationYear}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50 cursor-pointer"
              >
                <option value="2025">2025</option>
                <option value="2026">2026</option>
                <option value="2027">2027</option>
                <option value="2028">2028</option>
                <option value="2029">2029+</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-ivory-300 block mb-1 font-mono">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="San Francisco, CA / London / Remote"
                className="w-full px-3.5 py-2 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 placeholder-ivory-500 focus:outline-none focus:border-bronze-500/50"
              />
            </div>
          </div>

          {/* Technical Skills */}
          <div>
            <label className="font-semibold text-ivory-300 block mb-1 font-mono">
              Technical Skills (Comma separated)
            </label>
            <input
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="TypeScript, Python, React, Next.js, PyTorch, GraphQL, AWS"
              className="w-full px-3.5 py-2 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 placeholder-ivory-500 focus:outline-none focus:border-bronze-500/50"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="font-semibold text-ivory-300 block mb-1 font-mono">
              Short Bio / Statement
            </label>
            <textarea
              rows={3}
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Brief summary of your interests, technical projects, and career goals..."
              className="w-full px-3.5 py-2 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 placeholder-ivory-500 focus:outline-none focus:border-bronze-500/50 resize-none"
            />
          </div>

          {/* Social Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-charcoal-cardBorder">
            <div>
              <label className="font-semibold text-ivory-300 block mb-1 flex items-center space-x-1.5 font-mono">
                <Github className="w-3.5 h-3.5 text-ivory-400" />
                <span>GitHub Profile URL</span>
              </label>
              <input
                type="url"
                name="githubUrl"
                value={formData.githubUrl}
                onChange={handleChange}
                placeholder="https://github.com/username"
                className="w-full px-3.5 py-2 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 placeholder-ivory-500 focus:outline-none focus:border-bronze-500/50"
              />
            </div>

            <div>
              <label className="font-semibold text-ivory-300 block mb-1 flex items-center space-x-1.5 font-mono">
                <Linkedin className="w-3.5 h-3.5 text-ivory-400" />
                <span>LinkedIn Profile URL</span>
              </label>
              <input
                type="url"
                name="linkedinUrl"
                value={formData.linkedinUrl}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/username"
                className="w-full px-3.5 py-2 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 placeholder-ivory-500 focus:outline-none focus:border-bronze-500/50"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-charcoal-cardBorder flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center space-x-1.5 px-6 py-2.5 rounded-xl font-bold text-xs text-charcoal-950 bg-bronze-500 hover:bg-bronze-400 shadow-button disabled:opacity-50 transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? "Saving..." : "Save Profile"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
