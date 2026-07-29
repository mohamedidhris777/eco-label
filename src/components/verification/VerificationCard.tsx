/**
 * EcoLabel X — Verification Module: Verification Card
 * Displays one claim's verdict, confidence, reasoning, and supporting evidence.
 */
"use client";

import { useState } from "react";
import { CATEGORY_CONFIG } from "@/components/claims/types";
import { type ClaimCategory } from "@/components/claims/types";
import { VerdictBadge }  from "./VerdictBadge";
import { EvidenceCard }  from "./EvidenceCard";
import { VERDICT_CONFIG, type ClaimVerificationResult } from "./types";

interface VerificationCardProps {
  result: ClaimVerificationResult;
  index:  number;
  style?: React.CSSProperties;
}

/** Safely look up category config with fallback */
function getCatCfg(category: string) {
  return CATEGORY_CONFIG[category as ClaimCategory] ?? {
    label: category, color: "#94a3b8", bg: "rgba(148,163,184,0.1)",
    border: "rgba(148,163,184,0.25)", icon: "🌍",
  };
}

function preview(text: string, max = 180) {
  if (text.length <= max) return { short: text, truncated: false };
  const cut = text.lastIndexOf(" ", max);
  return { short: text.slice(0, cut > 0 ? cut : max) + "…", truncated: true };
}

export function VerificationCard({ result, index, style }: VerificationCardProps) {
  const [expanded, setExpanded] = useState(false);
  const cfg     = getCatCfg(result.category);
  const vCfg    = VERDICT_CONFIG[result.verdict];
  const { short, truncated } = preview(result.claim);
  const confPct = Math.round(result.verification_confidence * 100);

  return (
    <article
      className="rounded-2xl p-4 flex flex-col gap-3 animate-slide-up transition-all duration-300"
      style={{
        background: "rgba(255,255,255,0.025)",
        border:     `1px solid ${vCfg.border}`,
        ...style,
      }}
      aria-label={`Claim ${index + 1}: ${result.verdict}`}
    >
      {/* ── Top row ── */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Verdict */}
        <VerdictBadge verdict={result.verdict} size="sm" />

        {/* Category */}
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
          style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}
        >
          <span aria-hidden="true">{cfg.icon}</span>
          {cfg.label}
        </span>

        {/* Page */}
        <span className="text-[10px] text-slate-500">
          Page {result.page}
        </span>

        {/* Verification confidence */}
        <span
          className="ml-auto text-[11px] font-bold tabular-nums"
          style={{ color: vCfg.color }}
          title={`Verification confidence: ${confPct}%`}
        >
          {confPct}%
        </span>
      </div>

      {/* ── Claim text ── */}
      <p className="text-[13px] text-slate-300 leading-relaxed">
        {expanded ? result.claim : short}
        {truncated && !expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="ml-1 text-[11px] underline underline-offset-2 font-semibold transition-colors"
            style={{ color: vCfg.color }}
          >
            more
          </button>
        )}
        {expanded && truncated && (
          <button
            onClick={() => setExpanded(false)}
            className="ml-1 text-[11px] underline underline-offset-2 text-slate-500 hover:text-white transition-colors"
          >
            less
          </button>
        )}
      </p>

      {/* ── Verdict reason ── */}
      <p className="text-[11px] text-slate-500 leading-relaxed border-l-2 pl-3"
         style={{ borderColor: vCfg.color + "40" }}>
        {result.verdict_reason}
      </p>

      {/* ── Evidence toggle ── */}
      {result.evidence.length > 0 && (
        <EvidenceSection evidence={result.evidence} verdictColor={vCfg.color} />
      )}

      {result.evidence.length === 0 && (
        <div className="text-[10px] text-slate-700 italic">
          No supporting passages found in document text.
        </div>
      )}
    </article>
  );
}

// ─── Collapsible evidence section ─────────────────────────────────────────────

function EvidenceSection({
  evidence,
  verdictColor,
}: {
  evidence:     ClaimVerificationResult["evidence"];
  verdictColor: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-[10px] font-semibold transition-colors w-full text-left"
        style={{ color: open ? verdictColor : "#64748b" }}
        aria-expanded={open}
        aria-label={`${open ? "Hide" : "Show"} ${evidence.length} evidence passages`}
      >
        <span
          className="w-4 h-4 rounded flex items-center justify-center text-[8px] flex-shrink-0 transition-colors"
          style={{ background: open ? `${verdictColor}20` : "rgba(255,255,255,0.05)" }}
          aria-hidden="true"
        >
          {open ? "▲" : "▼"}
        </span>
        {open ? "Hide" : "Show"} {evidence.length} supporting passage{evidence.length !== 1 ? "s" : ""}
      </button>

      {open && (
        <div className="mt-2 space-y-2">
          {evidence.map((ev, i) => (
            <EvidenceCard key={i} evidence={ev} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
