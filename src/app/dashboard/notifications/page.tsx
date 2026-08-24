"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Info,
  ExternalLink,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (data.notifications) {
        setNotifications(data.notifications);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/notifications", { method: "POST" });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "POST" });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getIcon = (type: string) => {
    switch (type) {
      case "APPROVAL":
        return <CheckCircle2 className="w-4.5 h-4.5 text-forest-400" />;
      case "REJECTION":
        return <AlertTriangle className="w-4.5 h-4.5 text-rose-400" />;
      case "OPPORTUNITY":
        return <Sparkles className="w-4.5 h-4.5 text-bronze-400" />;
      case "SYSTEM":
      default:
        return <Info className="w-4.5 h-4.5 text-ivory-400" />;
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif-heading font-medium text-xl sm:text-2xl text-ivory-100">
            Notifications Center
          </h2>
          <p className="text-xs text-ivory-500 mt-0.5">
            Stay updated on submission approvals, moderator feedback, and platform alerts.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-charcoal-card border border-charcoal-cardBorder text-xs font-semibold text-bronze-400 hover:text-bronze-300 transition-colors shadow-card"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="p-8 text-center text-ivory-500 text-xs animate-pulse">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16 rounded-3xl bg-charcoal-card border border-charcoal-cardBorder p-8 space-y-3 shadow-card">
            <div className="w-12 h-12 rounded-2xl bg-charcoal-900 border border-charcoal-cardBorder flex items-center justify-center mx-auto text-ivory-500">
              <Bell className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-ivory-100">No notifications yet</p>
            <p className="text-xs text-ivory-500">
              When your opportunity submissions are reviewed or updated, they will appear here.
            </p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => !notif.isRead && handleMarkRead(notif.id)}
              className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                notif.isRead
                  ? "bg-charcoal-card/60 border-charcoal-cardBorder text-ivory-400"
                  : "bg-charcoal-card border-bronze-500/30 shadow-card text-ivory-200"
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className="p-2 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder flex-shrink-0">
                  {getIcon(notif.type)}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-xs sm:text-sm text-ivory-100 flex items-center space-x-2">
                      <span>{notif.title}</span>
                      {!notif.isRead && (
                        <span className="w-1.5 h-1.5 rounded-full bg-bronze-400" />
                      )}
                    </h3>
                    <span className="text-[10.5px] font-mono text-ivory-500">
                      {formatDate(notif.createdAt)}
                    </span>
                  </div>

                  <p className="text-xs text-ivory-400 leading-relaxed">
                    {notif.message}
                  </p>

                  {notif.link && (
                    <div className="pt-2">
                      <Link
                        href={notif.link}
                        className="inline-flex items-center space-x-1 text-xs font-semibold text-bronze-400 hover:text-bronze-300 font-mono"
                      >
                        <span>View Details</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
