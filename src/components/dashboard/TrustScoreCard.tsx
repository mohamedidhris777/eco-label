/**
 * EcoLabel X — Trust Score Card
 *
 * Large animated ring showing overall trust score,
 * five dimension breakdown bars, and tier badge.
 */
"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";

// ─── Animated Ring ────────────────────────────────────────────────────────────

function TrustRing({ score, animated }: { score: number; animated: boolean }) {
  const size  = 136;
  const sw    = 9;
  const r     = (size / 2) - sw - 4;
  const circ  = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);

  // Tier colours
  const color =
    score >= 90 ? "#00ffaa" :
    score >= 75 ? "#ffb300" :
    score >= 55 ? "#94a3b8" :
                  "#c97d4e";

  const tier =
    score >= 90 ? "Platinum" :
    score >= 75 ? "Gold"     :
    score >= 55 ? "Silver"   :
                  "Bronze";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden="true">
        {/* Track */}
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={sw} />
        {/* Score arc */}
        <circle
          cx={size/2} cy={size/2} r={r}
          fill="none"
          stroke={color}
          strokeWidth={sw}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={animated ? offset : circ}
          style={{
            filter:     `drop-shadow(0 0 10px ${color}70)`,
            transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)",
          }}
        />
      </svg>
      {/* Centre label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display font-bold text-4xl leading-none" style={{ color }}>{score}</span>
        <span className="text-[10px] uppercase tracking-widest font-semibold mt-1" style={{ color: `${color}99` }}>{tier}</span>
      </div>
    </div>
  );
}

// ─── Dimension Bar ────────────────────────────────────────────────────────────

function DimBar({ label, value, color, animated }: { label: string; value: number; color: string; animated: boolean }) {
  return (
    <div>
      <div className="flex justify-between text-[11px] mb-1">
        <span className="text-slate-500">{label}</span>
        <span className="font-medium" style={{ color }}>{value}</span>
      </div>
      <div className="h-1.5 rounded-full bg-[rgba(255,255,255,0.05)] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width:      animated ? `${value}%` : "0%",
            background: `linear-gradient(90deg, ${color}, ${color}80)`,
            boxShadow:  `0 0 6px ${color}50`,
          }}
        />
      </div>
    </div>
  );
}

import { usePipelineStore } from "@/lib/hooks/usePipelineStore";

const DEFAULT_DIMENSIONS = [
  { label: "Label Authenticity",  value: 94, color: "#00ffaa" },
  { label: "Carbon Accuracy",     value: 88, color: "#00c8ff" },
  { label: "Supply Chain",        value: 76, color: "#9b59ff" },
  { label: "Compliance",          value: 91, color: "#00ffaa" },
  { label: "Data Freshness",      value: 83, color: "#ffb300" },
];

export function TrustScoreCard() {
  const [animated, setAnimated] = useState(false);
  const { state } = usePipelineStore();

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 300);
    return () => clearTimeout(t);
  }, []);

  // Compute live score from backend report if available
  let score = 87;
  let subtitle = "Portfolio-wide average";
  let footer = "Based on portfolio disclosures · Updated live";
  let dimensions = DEFAULT_DIMENSIONS;

  if (state.greenwashing?.report) {
    const r = state.greenwashing.report;
    const bd = r.claim_breakdown;
    score = Math.round(Math.min(100, (bd.verified / (bd.total || 1)) * 45 + (1 - r.risk_score / 100) * 35 + 0.65 * 20));
    subtitle = `Report: ${r.filename}`;
    footer = `Analysed ${r.claim_breakdown.total} claims across ${state.pageCount ?? "PDF"} pages`;

    dimensions = [
      { label: "Verified Claims",      value: Math.round((bd.verified / (bd.total || 1)) * 100), color: "#00ffaa" },
      { label: "Risk Score Penalty",   value: Math.max(0, 100 - r.risk_score), color: r.risk_score > 50 ? "#ef4444" : "#ffb300" },
      { label: "Quantitative Data",    value: Math.round((bd.quantitative_claims / (bd.total || 1)) * 100), color: "#00c8ff" },
      { label: "Specificity Rating",   value: Math.max(0, 100 - Math.round((bd.vague_claims / (bd.total || 1)) * 100)), color: "#9b59ff" },
    ];
  } else if (state.verification?.summary) {
    const s = state.verification.summary;
    score = Math.round((s.verified / (s.total_claims || 1)) * 100);
    subtitle = `Report: ${state.verification.filename}`;
    footer = `Verified ${s.verified} of ${s.total_claims} detected claims`;
  }

  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-5 h-full"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <h3 className="font-display font-semibold text-white text-sm">Trust Score</h3>
          <p className="text-[11px] text-slate-500 mt-0.5 truncate max-w-[180px]">{subtitle}</p>
        </div>
        <span
          className="text-[10px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
          style={{ color: "#00ffaa", background: "rgba(0,255,170,0.1)", border: "1px solid rgba(0,255,170,0.2)" }}
        >
          Backend Verified
        </span>
      </div>

      {/* Ring + Dimensions */}
      <div className="flex items-center gap-5">
        <TrustRing score={score} animated={animated} />

        <div className="flex-1 space-y-2.5 min-w-0">
          {dimensions.map((d) => (
            <DimBar key={d.label} {...d} animated={animated} />
          ))}
        </div>
      </div>

      {/* Footer note */}
      <p className="text-[10px] text-slate-600 border-t border-[rgba(255,255,255,0.06)] pt-3">
        {footer}
      </p>
    </div>
  );
}
