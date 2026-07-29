/**
 * EcoLabel X — Verification Module: Stats Bar
 * Donut-ring summary + headline numbers.
 */
"use client";

import { VERDICT_CONFIG, type VerificationSummary } from "./types";

interface VerificationStatsProps {
  summary:   VerificationSummary;
  filename:  string;
  pageCount: number;
}

export function VerificationStats({ summary, filename, pageCount }: VerificationStatsProps) {
  const total = summary.total_claims || 1;

  // Donut segments (CSS conic-gradient)
  const verifiedPct  = (summary.verified           / total) * 100;
  const partialPct   = (summary.partially_verified / total) * 100;
  const notPct       = (summary.not_verified        / total) * 100;

  const donut = `conic-gradient(
    ${VERDICT_CONFIG.verified.color} 0% ${verifiedPct}%,
    ${VERDICT_CONFIG.partially_verified.color} ${verifiedPct}% ${verifiedPct + partialPct}%,
    ${VERDICT_CONFIG.not_verified.color} ${verifiedPct + partialPct}% 100%
  )`;

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <div className="flex flex-wrap gap-8 items-center">

        {/* ── Donut ring ── */}
        <div className="relative flex-shrink-0" aria-hidden="true">
          <div
            className="w-20 h-20 rounded-full"
            style={{ background: donut }}
          />
          <div
            className="absolute inset-2 rounded-full flex items-center justify-center"
            style={{ background: "rgba(5,10,24,0.95)" }}
          >
            <span className="text-xs font-bold text-white tabular-nums">{total}</span>
          </div>
        </div>

        {/* ── Verdict counts ── */}
        <div className="flex flex-wrap gap-6">
          {(["verified", "partially_verified", "not_verified"] as const).map((v) => {
            const cfg   = VERDICT_CONFIG[v];
            const count = summary[v];
            const pct   = Math.round((count / total) * 100);
            return (
              <div key={v} className="flex flex-col">
                <span className="text-[9px] uppercase tracking-widest mb-0.5" style={{ color: cfg.color }}>
                  {cfg.icon} {cfg.label}
                </span>
                <span className="text-2xl font-display font-bold tabular-nums" style={{ color: cfg.color }}>
                  {count}
                </span>
                <span className="text-[10px] text-slate-600 tabular-nums">{pct}%</span>
              </div>
            );
          })}

          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-widest text-slate-600 mb-0.5">Avg Confidence</span>
            <span
              className="text-2xl font-display font-bold tabular-nums"
              style={{
                color: summary.avg_verification_confidence >= 0.65 ? "#00ffaa"
                     : summary.avg_verification_confidence >= 0.45 ? "#ffb300"
                     : "#ef4444",
              }}
            >
              {Math.round(summary.avg_verification_confidence * 100)}%
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-widest text-slate-600 mb-0.5">Pages</span>
            <span className="text-2xl font-display font-bold text-slate-400 tabular-nums">{pageCount}</span>
          </div>
        </div>

        {/* ── File info ── */}
        <div className="ml-auto text-right">
          <span className="text-[9px] uppercase tracking-widest text-slate-600">Source</span>
          <p className="text-xs text-slate-400 mt-0.5 max-w-[200px] truncate" title={filename}>
            {filename}
          </p>
        </div>
      </div>
    </div>
  );
}
