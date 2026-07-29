/**
 * EcoLabel X — Dashboard Top Navigation
 *
 * Fixed top bar inside the dashboard: search, notifications, date, user avatar.
 */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils/cn";

// ─── Notification Dot ─────────────────────────────────────────────────────────

function NotificationBell({ count }: { count: number }) {
  const [open, setOpen] = useState(false);

  const NOTIFS = [
    { id: 1, text: "Oat Milk analysis complete — Score: 92",    time: "2m ago",  dot: "#00ffaa" },
    { id: 2, text: "Greenwashing flag raised on SKU #4821",     time: "18m ago", dot: "#ef4444" },
    { id: 3, text: "EU ESPR compliance report ready",            time: "1h ago",  dot: "#9b59ff" },
  ] as const;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-[rgba(255,255,255,0.06)] transition-all duration-200"
        aria-label={`${count} notifications`}
        aria-expanded={open}
      >
        <BellIcon />
        {count > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#00ffaa] border border-[#050a18] animate-beacon" />
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} aria-hidden="true" />
          <div
            className="absolute right-0 top-11 z-40 w-80 rounded-2xl overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.6)]"
            style={{ background: "#0a1228", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.07)] flex items-center justify-between">
              <span className="text-xs font-semibold text-white uppercase tracking-widest">Notifications</span>
              <span className="text-[10px] text-[#00ffaa] cursor-pointer hover:underline">Mark all read</span>
            </div>
            <ul className="divide-y divide-[rgba(255,255,255,0.05)]">
              {NOTIFS.map((n) => (
                <li key={n.id} className="flex gap-3 px-4 py-3.5 hover:bg-[rgba(255,255,255,0.03)] transition-colors cursor-default">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: n.dot }} />
                  <div className="min-w-0">
                    <p className="text-xs text-slate-300 leading-snug">{n.text}</p>
                    <p className="text-[10px] text-slate-600 mt-1">{n.time}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="px-4 py-3 border-t border-[rgba(255,255,255,0.07)] text-center">
              <span className="text-[11px] text-slate-500 hover:text-[#00ffaa] cursor-pointer transition-colors">
                View all notifications
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── User Menu ────────────────────────────────────────────────────────────────

function UserMenu() {
  const [open, setOpen] = useState(false);
  const { userProfile } = useApp();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-[rgba(255,255,255,0.05)] transition-all duration-200"
        aria-expanded={open}
        aria-label="User menu"
      >
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#00ffaa] to-[#00c8ff] flex items-center justify-center text-[10px] font-bold text-[#050a18] flex-shrink-0">
          {userProfile.initials}
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-xs font-semibold text-white leading-none">{userProfile.name}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">{userProfile.role}</p>
        </div>
        <ChevronDownIcon className={cn("w-3 h-3 text-slate-500 transition-transform duration-200", open && "rotate-180")} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} aria-hidden="true" />
          <div
            className="absolute right-0 top-11 z-40 w-48 rounded-2xl overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.6)]"
            style={{ background: "#0a1228", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            {[
              { label: "Profile",   href: "/dashboard/profile" as const,  icon: "👤" },
              { label: "Settings",  href: "/dashboard/settings" as const, icon: "⚙️" },
              { label: "Help",      href: "/dashboard/settings" as const, icon: "💬" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className="w-full flex items-center gap-3 px-4 py-3 text-xs text-slate-400 hover:text-white hover:bg-[rgba(255,255,255,0.04)] transition-colors text-left"
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            ))}
            <div className="border-t border-[rgba(255,255,255,0.07)]">
              <button className="w-full flex items-center gap-3 px-4 py-3 text-xs text-red-400 hover:text-red-300 hover:bg-[rgba(239,68,68,0.05)] transition-colors text-left">
                <span>🚪</span>
                Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Search Bar ───────────────────────────────────────────────────────────────

function SearchBar() {
  const [focused, setFocused] = useState(false);

  return (
    <div
      className={cn(
        "hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all duration-200",
        focused
          ? "bg-[rgba(255,255,255,0.06)] border border-[rgba(0,255,170,0.3)] shadow-[0_0_0_3px_rgba(0,255,170,0.06)]"
          : "bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)]"
      )}
      style={{ width: focused ? 260 : 200, transition: "width 0.3s ease, border 0.2s, box-shadow 0.2s" }}
    >
      <SearchIcon className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
      <input
        type="search"
        placeholder="Search products, labels…"
        className="bg-transparent text-xs text-white placeholder:text-slate-600 outline-none w-full"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        aria-label="Search"
      />
      <kbd className="hidden lg:flex items-center px-1.5 py-0.5 rounded text-[9px] text-slate-600 border border-[rgba(255,255,255,0.08)] font-mono">
        ⌘K
      </kbd>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

interface DashboardTopNavProps {
  title?:    string;
  subtitle?: string;
}

export function DashboardTopNav({
  title    = "Overview",
  subtitle = "Your sustainability intelligence at a glance.",
}: DashboardTopNavProps) {
  const [now, setNow] = useState<string>("");

  useEffect(() => {
    setNow(
      new Date().toLocaleDateString("en-US", {
        weekday: "short",
        month:   "short",
        day:     "numeric",
      })
    );
  }, []);

  return (
    <header
      className="sticky top-0 z-20 flex items-center justify-between gap-4 px-6 h-16 border-b border-[rgba(255,255,255,0.07)]"
      style={{ background: "rgba(5,10,24,0.85)", backdropFilter: "blur(20px)" }}
    >
      {/* Left — page title */}
      <div className="min-w-0">
        <h1 className="font-display font-semibold text-white text-base leading-none truncate">{title}</h1>
        <p className="text-[11px] text-slate-500 mt-0.5 hidden sm:block truncate">{subtitle}</p>
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <SearchBar />

        {/* Date chip */}
        <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-slate-500 px-3 py-1.5 rounded-lg border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.02)]">
          <CalendarIcon className="w-3 h-3" />
          {now}
        </div>

        <NotificationBell count={3} />
        <UserMenu />
      </div>
    </header>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────
function BellIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}
function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
