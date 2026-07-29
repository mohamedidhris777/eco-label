/**
 * EcoLabel X — Greenwashing Analyzer: Report Components
 * Modular sub-components: ReasonCard, MissingEvidenceList, RecommendationCard, FlagsRow, BreakdownBar
 */
"use client";

import { useState } from "react";
import {
  SEVERITY_COLOR, PRIORITY_COLOR, PRIORITY_LABEL,
  type GreenwashingReason, type MissingEvidence,
  type Recommendation, type ClaimBreakdown, type ReportFlags,
} from "./types";

// ─── Severity/Priority pill ───────────────────────────────────────────────────

function Pill({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide"
      style={{ color, background: `${color}18`, border: `1px solid ${color}40` }}
    >
      {label}
    </span>
  );
}

// ─── Reason Card ─────────────────────────────────────────────────────────────

interface ReasonCardProps { reason: GreenwashingReason; index: number; }

export function ReasonCard({ reason, index }: ReasonCardProps) {
  const [open, setOpen] = useState(false);
  const color = SEVERITY_COLOR[reason.severity];

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: `1px solid ${color}25`, background: `${color}06` }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start gap-3 p-4 text-left"
        aria-expanded={open}
      >
        <span
          className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5"
          style={{ background: `${color}20`, color }}
          aria-hidden="true"
        >
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <Pill label={reason.severity} color={color} />
            <span className="text-[9px] text-slate-600 capitalize">{reason.category}</span>
            {reason.affected_claims > 0 && (
              <span className="text-[9px] text-slate-600">
                {reason.affected_claims} claim{reason.affected_claims !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          <p className="text-sm font-semibold text-slate-200">{reason.title}</p>
        </div>
        <span
          className="flex-shrink-0 text-[10px] transition-transform mt-1"
          style={{ color, transform: open ? "rotate(180deg)" : undefined }}
          aria-hidden="true"
        >▼</span>
      </button>

      {open && (
        <div className="px-4 pb-4 border-t" style={{ borderColor: `${color}15` }}>
          <p className="text-[12px] text-slate-400 leading-relaxed mt-3">
            {reason.description}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Missing Evidence List ────────────────────────────────────────────────────

interface MissingEvidenceListProps { items: MissingEvidence[]; }

export function MissingEvidenceList({ items }: MissingEvidenceListProps) {
  const grouped = items.reduce<Record<string, MissingEvidence[]>>((acc, item) => {
    (acc[item.category] ??= []).push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([cat, catItems]) => (
        <div key={cat}>
          <h4 className="text-[9px] uppercase tracking-widest text-slate-600 mb-2 flex items-center gap-2">
            <span className="h-px flex-1 bg-white/5" />
            {cat}
            <span className="h-px flex-1 bg-white/5" />
          </h4>
          <ul className="space-y-1.5">
            {catItems.map((item, i) => {
              const color = PRIORITY_COLOR[item.priority];
              return (
                <li key={i} className="flex items-start gap-2.5">
                  <span
                    className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-1.5"
                    style={{ background: color }}
                    aria-hidden="true"
                  />
                  <span className="text-[12px] text-slate-400 leading-snug">{item.item}</span>
                  <Pill label={PRIORITY_LABEL[item.priority]} color={color} />
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

// ─── Recommendation Card ─────────────────────────────────────────────────────

interface RecommendationCardProps { rec: Recommendation; index: number; }

export function RecommendationCard({ rec, index }: RecommendationCardProps) {
  const color = PRIORITY_COLOR[rec.priority];

  return (
    <div
      className="rounded-xl p-4 flex gap-3"
      style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <div
        className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
        style={{ background: `${color}18`, color }}
        aria-hidden="true"
      >
        {index + 1}
      </div>
      <div className="flex-1 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <Pill label={PRIORITY_LABEL[rec.priority]} color={color} />
          <span className="text-[9px] text-slate-600 capitalize">{rec.category}</span>
        </div>
        <p className="text-sm font-semibold text-slate-200">{rec.action}</p>
        <p className="text-[11px] text-slate-500 leading-relaxed">{rec.rationale}</p>
      </div>
    </div>
  );
}

// ─── Claim Breakdown Bar ──────────────────────────────────────────────────────

interface BreakdownBarProps { breakdown: ClaimBreakdown; }

export function BreakdownBar({ breakdown }: BreakdownBarProps) {
  const { total, verified, partially_verified, not_verified } = breakdown;
  if (total === 0) return null;

  const vPct   = (verified           / total) * 100;
  const pPct   = (partially_verified / total) * 100;
  const nPct   = (not_verified        / total) * 100;

  return (
    <div className="space-y-3">
      {/* Stacked bar */}
      <div
        className="w-full h-3 rounded-full overflow-hidden flex"
        role="img"
        aria-label={`Verified: ${verified}, Partial: ${partially_verified}, Not verified: ${not_verified}`}
      >
        <div style={{ width: `${vPct}%`, background: "#00ffaa" }} title={`Verified: ${verified}`} />
        <div style={{ width: `${pPct}%`, background: "#ffb300" }} title={`Partial: ${partially_verified}`} />
        <div style={{ width: `${nPct}%`, background: "#ef4444" }} title={`Not verified: ${not_verified}`} />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4">
        {[
          { label: "Verified",     count: verified,           color: "#00ffaa" },
          { label: "Partial",      count: partially_verified, color: "#ffb300" },
          { label: "Not Verified", count: not_verified,        color: "#ef4444" },
          { label: "Vague",        count: breakdown.vague_claims, color: "#94a3b8" },
          { label: "Quantified",   count: breakdown.quantitative_claims, color: "#9b59ff" },
        ].map(({ label, count, color }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} aria-hidden="true" />
            <span className="text-[10px] text-slate-500">{label}</span>
            <span className="text-[10px] font-bold tabular-nums" style={{ color }}>{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Flags Row ────────────────────────────────────────────────────────────────

interface FlagsRowProps { flags: ReportFlags; }

export function FlagsRow({ flags }: FlagsRowProps) {
  const items = [
    { label: "Third-Party Verification", value: flags.has_third_party,    icon: "🔍" },
    { label: "Certifications",           value: flags.has_certifications, icon: "🏅" },
    { label: "Year Timelines",           value: flags.has_timelines,       icon: "🎯" },
  ];

  return (
    <div className="flex flex-wrap gap-3">
      {items.map(({ label, value, icon }) => (
        <div
          key={label}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-medium"
          style={{
            background: value ? "rgba(0,255,170,0.07)" : "rgba(239,68,68,0.07)",
            border:     `1px solid ${value ? "rgba(0,255,170,0.2)" : "rgba(239,68,68,0.2)"}`,
            color:      value ? "#00ffaa" : "#ef4444",
          }}
        >
          <span aria-hidden="true">{icon}</span>
          {label}
          <span className="font-bold ml-1" aria-label={value ? "present" : "absent"}>
            {value ? "✓" : "✗"}
          </span>
        </div>
      ))}
    </div>
  );
}
