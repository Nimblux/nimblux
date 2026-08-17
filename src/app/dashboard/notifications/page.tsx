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
  Trash2,
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
        return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      case "REJECTION":
        return <AlertTriangle className="w-5 h-5 text-rose-400" />;
      case "OPPORTUNITY":
        return <Sparkles className="w-5 h-5 text-cyan-400" />;
      case "SYSTEM":
      default:
        return <Info className="w-5 h-5 text-indigo-400" />;
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-xl sm:text-2xl text-white">
            Notifications Center
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Stay updated on submission approvals, moderator feedback, and platform alerts.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:bg-slate-850 transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs animate-pulse">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16 rounded-3xl glass-panel border border-slate-800 bg-slate-900/40 p-8 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
              <Bell className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-white">No notifications yet</p>
            <p className="text-xs text-slate-400">
              When your submissions are approved or updated, they will show up here.
            </p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => !notif.isRead && handleMarkRead(notif.id)}
              className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                notif.isRead
                  ? "bg-slate-900/40 border-slate-800/80 text-slate-400"
                  : "bg-indigo-950/30 border-indigo-500/30 shadow-md shadow-indigo-950/20 text-slate-200"
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex-shrink-0">
                  {getIcon(notif.type)}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-white flex items-center space-x-2">
                      <span>{notif.title}</span>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-indigo-400" />
                      )}
                    </h3>
                    <span className="text-[11px] text-slate-400">
                      {formatDate(notif.createdAt)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {notif.message}
                  </p>

                  {notif.link && (
                    <div className="pt-2">
                      <Link
                        href={notif.link}
                        className="inline-flex items-center space-x-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
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
