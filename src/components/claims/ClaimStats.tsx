/**
 * EcoLabel X — Claims Module: Stats Bar
 * Overview strip: total claims, avg confidence, high-confidence count,
 * pages scanned, and a mini category breakdown.
 */
"use client";

import { CATEGORY_CONFIG, type ClaimsSummary, type ClaimCategory } from "./types";

interface ClaimStatsProps {
  summary:   ClaimsSummary;
  filename:  string;
  pageCount: number;
}

export function ClaimStats({ summary, filename, pageCount }: ClaimStatsProps) {
  const topCategories = Object.entries(summary.by_category)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5) as [ClaimCategory, number][];

  const maxCount = topCategories[0]?.[1] ?? 1;

  return (
    <div
      className="rounded-2xl p-5 space-y-4"
      style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      {/* ── Headline stats ── */}
      <div className="flex flex-wrap gap-6">
        {[
          {
            label: "Total Claims",
            value: summary.total_claims,
            color: "#00ffaa",
            fmt:   (v: number) => v.toLocaleString(),
          },
          {
            label: "Avg Confidence",
            value: summary.avg_confidence,
            color: summary.avg_confidence >= 0.75 ? "#00ffaa" : summary.avg_confidence >= 0.6 ? "#ffb300" : "#ef4444",
            fmt:   (v: number) => `${Math.round(v * 100)}%`,
          },
          {
            label: "High Confidence",
            value: summary.high_confidence_count,
            color: "#00c8ff",
            fmt:   (v: number) => v.toLocaleString(),
          },
          {
            label: "Pages Scanned",
            value: pageCount,
            color: "#9b59ff",
            fmt:   (v: number) => v.toLocaleString(),
          },
          {
            label: "Pages with Claims",
            value: summary.pages_with_claims.length,
            color: "#ffb300",
            fmt:   (v: number) => v.toLocaleString(),
          },
        ].map(({ label, value, color, fmt }) => (
          <div key={label} className="flex flex-col min-w-[90px]">
            <span className="text-[9px] uppercase tracking-widest text-slate-600 mb-1">{label}</span>
            <span className="text-2xl font-display font-bold tabular-nums" style={{ color }}>
              {fmt(value)}
            </span>
          </div>
        ))}

        {/* File info */}
        <div className="ml-auto flex flex-col justify-center text-right">
          <span className="text-[9px] uppercase tracking-widest text-slate-600">File</span>
          <span className="text-xs text-slate-400 mt-0.5 max-w-[200px] truncate" title={filename}>
            {filename}
          </span>
        </div>
      </div>

      {/* ── Category breakdown ── */}
      {topCategories.length > 0 && (
        <div>
          <p className="text-[9px] uppercase tracking-widest text-slate-600 mb-3">Top categories</p>
          <div className="space-y-2">
            {topCategories.map(([cat, count]) => {
              const cfg  = CATEGORY_CONFIG[cat];
              const pct  = Math.round((count / maxCount) * 100);
              return (
                <div key={cat} className="flex items-center gap-3">
                  <span className="text-[11px] w-32 flex-shrink-0 flex items-center gap-1.5 text-slate-400">
                    <span aria-hidden="true">{cfg.icon}</span>
                    {cfg.label}
                  </span>
                  <div
                    className="flex-1 h-1.5 rounded-full overflow-hidden"
                    style={{ background: "rgba(255,255,255,0.05)" }}
                    role="progressbar"
                    aria-valuenow={count}
                    aria-valuemax={maxCount}
                    aria-label={`${cfg.label}: ${count} claims`}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: cfg.color, boxShadow: `0 0 6px ${cfg.color}60` }}
                    />
                  </div>
                  <span
                    className="text-[11px] font-bold tabular-nums w-6 text-right"
                    style={{ color: cfg.color }}
                  >
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
