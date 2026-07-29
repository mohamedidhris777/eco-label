/**
 * EcoLabel X — Results Module: Evidence Timeline
 * Vertical timeline sorted by page number — evidence passages with verdict colouring.
 */
"use client";

import { useState } from "react";
import { CATEGORY_CONFIG, type ClaimCategory } from "@/components/claims/types";
import { VERDICT_COLORS, type TimelineEntry } from "./types";

interface EvidenceTimelineProps {
  entries: TimelineEntry[];
}

function getCatCfg(cat: string) {
  return CATEGORY_CONFIG[cat as ClaimCategory] ?? { icon: "🌍", label: cat, color: "#94a3b8" };
}

export function EvidenceTimeline({ entries }: EvidenceTimelineProps) {
  const [filter, setFilter] = useState<"all" | "verified" | "partially_verified" | "not_verified">("all");
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const filtered = filter === "all" ? entries : entries.filter((e) => e.verdict === filter);

  const toggle = (idx: number) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });

  const verdictLabel: Record<string, string> = {
    all: "All", verified: "Verified", partially_verified: "Partial", not_verified: "Rejected",
  };
  const verdictCount = (v: string) => v === "all" ? entries.length : entries.filter((e) => e.verdict === v).length;

  return (
    <div className="space-y-4">
      {/* Filter pills */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter timeline">
        {(["all", "verified", "partially_verified", "not_verified"] as const).map((v) => {
          const active = filter === v;
          const color  = v === "all" ? "#64748b" : VERDICT_COLORS[v].color;
          return (
            <button
              key={v}
              onClick={() => setFilter(v)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold transition-all"
              style={{
                color:      active ? "#050a18" : color,
                background: active ? color      : `${color}12`,
                border:     `1px solid ${active ? color : color + "40"}`,
              }}
              aria-pressed={active}
            >
              {v !== "all" && <span aria-hidden="true">{VERDICT_COLORS[v].icon}</span>}
              {verdictLabel[v]}
              <span className="opacity-70">({verdictCount(v)})</span>
            </button>
          );
        })}
        <span className="ml-auto text-[10px] text-slate-600 self-center">
          {filtered.length} event{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical spine */}
        <div className="absolute left-8 top-0 bottom-0 w-px bg-white/5" aria-hidden="true" />

        <ol className="space-y-1" aria-label="Evidence timeline">
          {filtered.map((entry, idx) => {
            const vc  = VERDICT_COLORS[entry.verdict];
            const cat = getCatCfg(entry.category);
            const open = expanded.has(idx);
            const confPct = Math.round(entry.confidence * 100);

            return (
              <li key={idx} className="relative flex gap-4 group">
                {/* Page badge (left) */}
                <div className="flex-shrink-0 w-16 flex flex-col items-center pt-3">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold z-10 border-2"
                    style={{ background: "#050a18", borderColor: vc.color, color: vc.color }}
                    aria-hidden="true"
                  >
                    {entry.page}
                  </div>
                  <span className="text-[8px] text-slate-700 mt-0.5">pg</span>
                </div>

                {/* Card */}
                <div
                  className="flex-1 mb-3 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 group-hover:scale-[1.005]"
                  style={{ border: `1px solid ${vc.border}`, background: open ? vc.bg : "rgba(255,255,255,0.02)" }}
                  onClick={() => toggle(idx)}
                >
                  <div className="px-4 py-3 flex items-start gap-3">
                    {/* Verdict icon */}
                    <span
                      className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5"
                      style={{ background: vc.bg, color: vc.color, border: `1px solid ${vc.border}` }}
                      aria-label={entry.verdict.replace(/_/g, " ")}
                    >
                      {vc.icon}
                    </span>

                    <div className="flex-1 min-w-0">
                      {/* Meta row */}
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="text-[9px]" aria-hidden="true">{cat.icon}</span>
                        <span className="text-[9px] text-slate-600 capitalize">{cat.label}</span>
                        <span
                          className="text-[9px] font-bold tabular-nums ml-auto"
                          style={{ color: vc.color }}
                          title={`Confidence: ${confPct}%`}
                        >
                          {confPct}%
                        </span>
                        <span
                          className="text-[8px]"
                          style={{ color: vc.color }}
                          aria-hidden="true"
                        >
                          {open ? "▲" : "▼"}
                        </span>
                      </div>

                      {/* Claim text */}
                      <p className="text-[12px] text-slate-300 leading-snug">
                        {entry.claim}
                      </p>
                    </div>
                  </div>

                  {/* Evidence (expanded) */}
                  {open && entry.evidence && (
                    <div className="px-4 pb-3 border-t" style={{ borderColor: vc.border }}>
                      <p className="text-[10px] text-slate-600 uppercase tracking-widest mt-2 mb-1">
                        Supporting evidence
                      </p>
                      <p className="text-[11px] text-slate-400 italic leading-relaxed border-l-2 pl-3"
                         style={{ borderColor: vc.color + "50" }}>
                        &ldquo;{entry.evidence}&rdquo;
                      </p>
                    </div>
                  )}

                  {open && !entry.evidence && (
                    <div className="px-4 pb-3 border-t" style={{ borderColor: vc.border }}>
                      <p className="text-[11px] text-slate-600 italic mt-2">
                        No corroborating evidence found in the document text.
                      </p>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-600">
            <p className="text-2xl mb-2" aria-hidden="true">🔎</p>
            <p className="text-sm">No {verdictLabel[filter].toLowerCase()} events found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
