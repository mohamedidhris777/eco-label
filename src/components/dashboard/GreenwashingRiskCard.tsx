/**
 * EcoLabel X — Greenwashing Risk Card
 *
 * Risk level gauge, flagged claims list with severity badges,
 * and a distribution breakdown of risk categories.
 */
"use client";

import { useEffect, useState } from "react";
import { usePipelineStore } from "@/lib/hooks/usePipelineStore";

// ─── Types ────────────────────────────────────────────────────────────────────

type RiskLevel = "critical" | "high" | "medium" | "low";

interface Flag {
  id:       string;
  sku:      string;
  product:  string;
  claim:    string;
  risk:     RiskLevel;
  detected: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const RISK_CONFIG: Record<RiskLevel, { label: string; color: string; bg: string }> = {
  critical: { label: "Critical", color: "#ef4444", bg: "rgba(239,68,68,0.12)"   },
  high:     { label: "High",     color: "#f97316", bg: "rgba(249,115,22,0.12)"  },
  medium:   { label: "Medium",   color: "#ffb300", bg: "rgba(255,179,0,0.12)"   },
  low:      { label: "Low",      color: "#00ffaa", bg: "rgba(0,255,170,0.12)"   },
};

const FLAGS: Flag[] = [
  { id: "1", sku: "#4821", product: "EcoFresh Detergent",   claim: '"100% biodegradable" — no certification',      risk: "critical", detected: "2m ago" },
  { id: "2", sku: "#3109", product: "GreenPack Bottles",    claim: '"Carbon neutral" — expired 2023 certificate',   risk: "high",     detected: "1h ago" },
  { id: "3", sku: "#7742", product: "NaturaSoap Bar",       claim: '"Plant-based" — 40% synthetic content found',   risk: "medium",   detected: "3h ago" },
  { id: "4", sku: "#0531", product: "OrganicOat Milk",      claim: '"Zero waste packaging" — unverified claim',     risk: "low",      detected: "6h ago" },
];

const DISTRIBUTION = [
  { level: "critical" as RiskLevel, count: 1,  pct: 8   },
  { level: "high"     as RiskLevel, count: 3,  pct: 25  },
  { level: "medium"   as RiskLevel, count: 5,  pct: 42  },
  { level: "low"      as RiskLevel, count: 3,  pct: 25  },
];

// ─── Gauge ────────────────────────────────────────────────────────────────────

function RiskGauge({ riskScore, animated }: { riskScore: number; animated: boolean }) {
  const angle = animated ? (riskScore / 100) * 180 : 0;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: 120, height: 60, overflow: "hidden" }}>
        <svg width={120} height={60} viewBox="0 0 120 60" aria-hidden="true">
          {[
            { color: "#00ffaa40", start: 0,   end: 45  },
            { color: "#ffb30040", start: 45,  end: 90  },
            { color: "#f9731640", start: 90,  end: 135 },
            { color: "#ef444440", start: 135, end: 180 },
          ].map((seg, i) => (
            <path
              key={i}
              d="M 10 60 A 50 50 0 0 1 110 60"
              fill="none"
              stroke={seg.color}
              strokeWidth={10}
            />
          ))}
          <g
            style={{
              transform: `rotate(${angle}deg)`,
              transformOrigin: "60px 60px",
              transition: "transform 1.2s cubic-bezier(0.4,0,0.2,1)",
            }}
          >
            <line x1="60" y1="60" x2="20" y2="60" stroke="#f97316" strokeWidth="3" strokeLinecap="round" />
            <circle cx="60" cy="60" r="5" fill="#f97316" />
          </g>
        </svg>
        <div className="absolute bottom-0 left-0 text-[9px] text-slate-600">Low</div>
        <div className="absolute bottom-0 right-0 text-[9px] text-slate-600">High</div>
      </div>
      <p className="text-xs text-slate-500">
        Risk Score: <span className="font-bold text-[#f97316]">{riskScore}/100</span>
      </p>
    </div>
  );
}

// ─── Flag Row ─────────────────────────────────────────────────────────────────

function FlagRow({ flag }: { flag: Flag }) {
  const cfg = RISK_CONFIG[flag.risk] ?? RISK_CONFIG.medium;
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-[rgba(255,255,255,0.05)] last:border-0">
      <span
        className="mt-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0"
        style={{ color: cfg.color, background: cfg.bg }}
      >
        {cfg.label}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <p className="text-[11px] font-semibold text-white truncate">{flag.product}</p>
          <span className="text-[10px] text-slate-600 flex-shrink-0">{flag.sku}</span>
        </div>
        <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">{flag.claim}</p>
      </div>
      <span className="text-[10px] text-slate-600 flex-shrink-0 mt-0.5">{flag.detected}</span>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function GreenwashingRiskCard() {
  const [animated, setAnimated] = useState(false);
  const { state } = usePipelineStore();

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 400);
    return () => clearTimeout(t);
  }, []);

  let riskScore = 48;
  let riskLevel = "Medium";
  let subtitle = "12 claims under review";
  let badgeLabel = "Medium Risk";
  let badgeColor = "#ffb300";
  let flags: Flag[] = FLAGS;

  if (state.greenwashing?.report) {
    const r = state.greenwashing.report;
    riskScore = r.risk_score;
    riskLevel = r.risk_level;
    subtitle = `Report: ${r.filename}`;
    badgeLabel = `${r.risk_level} Risk`;
    badgeColor = r.risk_color;

    if (r.reasons && r.reasons.length > 0) {
      flags = r.reasons.slice(0, 4).map((res, i) => ({
        id: String(i + 1),
        sku: `Pg ${i + 1}`,
        product: res.title,
        claim: res.description || "Identified risk signal in report disclosure",
        risk: (res.severity in RISK_CONFIG ? res.severity : "medium") as RiskLevel,
        detected: "Analyzed",
      }));
    }
  }

  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-4 h-full"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <h3 className="font-display font-semibold text-white text-sm">Greenwashing Risk</h3>
          <p className="text-[11px] text-slate-500 mt-0.5 truncate max-w-[240px]">{subtitle}</p>
        </div>
        <span
          className="text-[10px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
          style={{ color: badgeColor, background: `${badgeColor}20`, border: `1px solid ${badgeColor}40` }}
        >
          {badgeLabel}
        </span>
      </div>

      {/* Gauge */}
      <div className="flex items-center justify-center py-2">
        <RiskGauge riskScore={riskScore} animated={animated} />
      </div>

      {/* Distribution */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] text-slate-500 mb-1">
          <span>Risk Distribution</span>
          <span>Level: {riskLevel}</span>
        </div>
        <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
          {DISTRIBUTION.map((d) => (
            <div
              key={d.level}
              className="h-full transition-all duration-700"
              style={{
                width:      animated ? `${d.pct}%` : "0%",
                background: RISK_CONFIG[d.level].color,
              }}
              title={`${RISK_CONFIG[d.level].label}: ${d.count}`}
            />
          ))}
        </div>
      </div>

      {/* Flagged items */}
      <div className="mt-1 flex-1">
        <p className="text-[11px] font-semibold text-slate-400 mb-2">Detected Risk Signals & Evidence</p>
        <div>
          {flags.map((flag) => (
            <FlagRow key={flag.id} flag={flag} />
          ))}
        </div>
      </div>
    </div>
  );
}
