"use client";

import React, { useEffect, useState } from "react";
import {
  Calendar,
  PlusCircle,
  Trash2,
  ExternalLink,
  MapPin,
  Sparkles,
  Save,
  CheckCircle2,
  X,
} from "lucide-react";
import { formatDate, getWorkModeBadge } from "@/lib/utils";

export default function AdminEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    banner: "",
    eventDate: "",
    location: "Virtual",
    mode: "REMOTE",
    registrationUrl: "",
    organizer: "NIMBLUX",
    isFeatured: true,
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/admin/events");
      const data = await res.json();
      if (data.events) setEvents(data.events);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        const data = await res.json();
        setEvents((prev) => [...prev, data.event]);
        setShowCreateModal(false);
        setFormData({
          title: "",
          description: "",
          banner: "",
          eventDate: "",
          location: "Virtual",
          mode: "REMOTE",
          registrationUrl: "",
          organizer: "NIMBLUX",
          isFeatured: true,
        });
      }
    } catch (e) {
      alert("Failed to create event");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    try {
      const res = await fetch(`/api/admin/events?eventId=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setEvents((prev) => prev.filter((ev) => ev.id !== id));
      }
    } catch (e) {
      alert("Failed to delete event");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-sage-400 text-xs font-mono font-bold uppercase tracking-wider mb-1">
            <Calendar className="w-4 h-4" />
            <span>Community Events</span>
          </div>
          <h1 className="font-serif-heading font-medium text-2xl sm:text-3xl text-ivory-100">
            Tech Events Manager
          </h1>
          <p className="text-xs text-ivory-500 mt-0.5">
            Host hackathons, webinars, summits, and campus workshops.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs text-charcoal-950 bg-bronze-500 hover:bg-bronze-400 shadow-button transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Event</span>
        </button>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-charcoal-card border border-charcoal-cardBorder" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-16 p-6 rounded-3xl bg-charcoal-card border border-charcoal-cardBorder text-ivory-500 text-xs shadow-card">
          No events created yet. Click "Create New Event" to publish one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {events.map((event) => {
            const modeBadge = getWorkModeBadge(event.mode);
            return (
              <div
                key={event.id}
                className="rounded-3xl bg-charcoal-card border border-charcoal-cardBorder p-5 flex flex-col justify-between space-y-4 shadow-card"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-ivory-400 mb-2">
                    <span className="font-bold text-bronze-400 font-mono text-[11px]">
                      {formatDate(event.eventDate)}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${modeBadge.className}`}
                    >
                      {modeBadge.label}
                    </span>
                  </div>

                  <h3 className="font-serif-heading font-medium text-base text-ivory-100 line-clamp-2">
                    {event.title}
                  </h3>

                  <p className="mt-2 text-xs text-ivory-400 line-clamp-2">
                    {event.description}
                  </p>

                  <div className="mt-3 flex items-center space-x-1 text-xs text-ivory-500">
                    <MapPin className="w-3.5 h-3.5 text-ivory-500 flex-shrink-0" />
                    <span className="truncate">{event.location}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-charcoal-cardBorder flex items-center justify-between">
                  <a
                    href={event.registrationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-bronze-400 hover:text-bronze-300 inline-flex items-center space-x-1 font-mono"
                  >
                    <span>Registration Link</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <button
                    onClick={() => handleDelete(event.id)}
                    className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-charcoal-card border border-charcoal-cardBorder p-6 sm:p-8 shadow-2xl space-y-4">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 p-2 text-ivory-500 hover:text-ivory-100 rounded-xl hover:bg-charcoal-900"
            >
              <X className="w-4.5 h-4.5" />
            </button>

            <h3 className="text-lg font-bold text-ivory-100">Create NIMBLUX Event</h3>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-ivory-300 block mb-1 font-mono">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g. AI & Full-Stack Tech Summit 2026"
                  className="w-full px-3.5 py-2 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-ivory-300 block mb-1 font-mono">
                    Event Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.eventDate}
                    onChange={(e) =>
                      setFormData({ ...formData, eventDate: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50"
                  />
                </div>

                <div>
                  <label className="font-semibold text-ivory-300 block mb-1 font-mono">
                    Mode
                  </label>
                  <select
                    value={formData.mode}
                    onChange={(e) =>
                      setFormData({ ...formData, mode: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50"
                  >
                    <option value="REMOTE" className="bg-charcoal-900">Remote</option>
                    <option value="HYBRID" className="bg-charcoal-900">Hybrid</option>
                    <option value="ONSITE" className="bg-charcoal-900">On-site</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-ivory-300 block mb-1 font-mono">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="Virtual (Zoom) / San Francisco Hub"
                  className="w-full px-3.5 py-2 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50"
                />
              </div>

              <div>
                <label className="font-semibold text-ivory-300 block mb-1 font-mono">
                  Registration URL *
                </label>
                <input
                  type="url"
                  required
                  value={formData.registrationUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, registrationUrl: e.target.value })
                  }
                  placeholder="https://luma.com/nimblux-summit"
                  className="w-full px-3.5 py-2 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50"
                />
              </div>

              <div>
                <label className="font-semibold text-ivory-300 block mb-1 font-mono">
                  Banner Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={formData.banner}
                  onChange={(e) =>
                    setFormData({ ...formData, banner: e.target.value })
                  }
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50"
                />
              </div>

              <div>
                <label className="font-semibold text-ivory-300 block mb-1 font-mono">
                  Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Overview of keynote speakers, tracks, prizes, and preparation..."
                  className="w-full px-3.5 py-2 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50 resize-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-charcoal-cardBorder">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-ivory-400 hover:text-ivory-100 bg-charcoal-900 border border-charcoal-cardBorder"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl font-bold text-charcoal-950 bg-bronze-500 hover:bg-bronze-400 shadow-button disabled:opacity-50"
                >
                  {submitting ? "Publishing..." : "Publish Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
