/**
 * EcoLabel X — Claims Module: Single Claim Card
 * Displays one detected claim with category badge, confidence, page number,
 * matched keywords, and an expandable full-text view.
 */
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { CATEGORY_CONFIG, type ClaimResult } from "./types";

interface ClaimCardProps {
  claim:  ClaimResult;
  index:  number;
  style?: React.CSSProperties;
}

/** Truncate claim text to a comfortable preview length */
function preview(text: string, max = 160): { short: string; truncated: boolean } {
  if (text.length <= max) return { short: text, truncated: false };
  const cut = text.lastIndexOf(" ", max);
  return { short: text.slice(0, cut > 0 ? cut : max) + "…", truncated: true };
}

export function ClaimCard({ claim, index, style }: ClaimCardProps) {
  const [expanded, setExpanded] = useState(false);
  const cfg = CATEGORY_CONFIG[claim.category];
  const { short, truncated } = preview(claim.claim);

  return (
    <article
      className="rounded-2xl p-4 flex flex-col gap-3 animate-slide-up transition-all duration-300 hover:scale-[1.01]"
      style={{
        background:  "rgba(255,255,255,0.03)",
        border:      `1px solid ${cfg.color}22`,
        boxShadow:   `0 0 0 0 ${cfg.color}00`,
        ...style,
      }}
      aria-label={`Sustainability claim on page ${claim.page}`}
    >
      {/* ── Top row: category + page + confidence ── */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Category badge */}
        <div
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
          style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}
        >
          <span aria-hidden="true">{cfg.icon}</span>
          {cfg.label}
        </div>

        {/* Page number */}
        <div
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium text-slate-400"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <PageIcon />
          Page {claim.page}
        </div>

        {/* Confidence */}
        <ConfidenceBadge value={claim.confidence} size="sm" />

        {/* Claim index */}
        <span className="ml-auto text-[10px] text-slate-700 font-mono tabular-nums">
          #{index + 1}
        </span>
      </div>

      {/* ── Claim text ── */}
      <p
        className="text-sm text-slate-300 leading-relaxed"
        style={{ fontFamily: "inherit" }}
      >
        {expanded ? claim.claim : short}
        {truncated && !expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="ml-1 text-[11px] font-semibold underline underline-offset-2 transition-colors"
            style={{ color: cfg.color }}
            aria-label="Show full claim text"
          >
            Show more
          </button>
        )}
        {expanded && truncated && (
          <button
            onClick={() => setExpanded(false)}
            className="ml-1 text-[11px] font-semibold underline underline-offset-2 text-slate-500 hover:text-white transition-colors"
            aria-label="Collapse claim text"
          >
            Show less
          </button>
        )}
      </p>

      {/* ── Keywords ── */}
      {claim.keywords_matched.length > 0 && (
        <div className="flex flex-wrap gap-1.5" aria-label="Matched keywords">
          {claim.keywords_matched.slice(0, 6).map((kw) => (
            <span
              key={kw}
              className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase tracking-wide"
              style={{
                color:      `${cfg.color}cc`,
                background: `${cfg.color}0d`,
                border:     `1px solid ${cfg.color}18`,
              }}
            >
              {kw}
            </span>
          ))}
          {claim.keywords_matched.length > 6 && (
            <span className="text-[9px] text-slate-600 self-center">
              +{claim.keywords_matched.length - 6} more
            </span>
          )}
        </div>
      )}
    </article>
  );
}

function PageIcon() {
  return (
    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}
