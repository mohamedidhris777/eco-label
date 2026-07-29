"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { ROUTES } from "@/lib/constants";

export function PipelineBanner() {
  const [mounted, setMounted] = useState(false);
  const { state, clearAnalysis } = useApp();

  useEffect(() => {
    setMounted(true);
  }, []);

  const hasAnyResult = mounted && !!(state.claims || state.verification || state.greenwashing);
  if (!hasAnyResult) return null;

  const stages = [
    { label: "Claims",       done: !!state.claims,       href: ROUTES.claims,       icon: "🔍" },
    { label: "Verify",       done: !!state.verification, href: ROUTES.verify,       icon: "🛡" },
    { label: "Greenwashing", done: !!state.greenwashing, href: ROUTES.greenwashing, icon: "⚠️" },
    { label: "Results",      done: !!state.greenwashing, href: ROUTES.results,       icon: "📊" },
    { label: "Audit",        done: !!state.greenwashing, href: ROUTES.audit,         icon: "📋" },
  ] as const;

  const filename = state.filename ?? "Document";
  const at = state.analyzedAt
    ? new Date(state.analyzedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <div
      className="mx-4 sm:mx-6 lg:mx-8 mt-4 rounded-2xl px-4 py-3 flex flex-wrap items-center gap-3"
      style={{ background: "rgba(0,255,170,0.04)", border: "1px solid rgba(0,255,170,0.12)" }}
      role="banner"
      aria-label="Previous analysis results available"
    >
      {/* Doc info */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-[#00ffaa] text-lg" aria-hidden="true">⚡</span>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-slate-300 truncate max-w-xs">{filename}</p>
          {at && <p className="text-[9px] text-slate-600">Analysed at {at} · cached</p>}
        </div>
      </div>

      {/* Stage pills */}
      <div className="flex flex-wrap items-center gap-1.5 flex-1">
        {stages.map(({ label, done, href, icon }) => (
          <Link
            key={label}
            href={href}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all"
            style={{
              background: done ? "rgba(0,255,170,0.1)"  : "rgba(255,255,255,0.04)",
              color:      done ? "#00ffaa"               : "#64748b",
              border:     `1px solid ${done ? "rgba(0,255,170,0.25)" : "rgba(255,255,255,0.06)"}`,
            }}
            aria-label={`Go to ${label} results`}
          >
            <span aria-hidden="true">{icon}</span>
            {label}
            {done && <span className="opacity-50" aria-hidden="true">✓</span>}
          </Link>
        ))}
      </div>

      {/* Clear button */}
      <button
        onClick={clearAnalysis}
        className="text-[10px] text-slate-600 hover:text-red-400 transition-colors flex-shrink-0"
        aria-label="Clear cached analysis results"
        title="Clear cached results"
      >
        ✕ Clear
      </button>
    </div>
  );
}
