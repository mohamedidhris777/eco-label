/**
 * EcoLabel X — Greenwashing Risk Card
 *
 * Risk level gauge, flagged claims list with severity badges,
 * and a distribution breakdown of risk categories.
 */
"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import { DEMO_RESULTS } from "@/components/results/types";

type RiskLevel = "critical" | "high" | "medium" | "low";

interface Flag {
  id:       string;
  sku:      string;
  product:  string;
  claim:    string;
  risk:     RiskLevel;
  detected: string;
}

const RISK_CONFIG: Record<RiskLevel, { label: string; color: string; bg: string }> = {
  critical: { label: "Critical", color: "#ef4444", bg: "rgba(239,68,68,0.12)"   },
  high:     { label: "High",     color: "#f97316", bg: "rgba(249,115,22,0.12)"  },
  medium:   { label: "Medium",   color: "#ffb300", bg: "rgba(255,179,0,0.12)"   },
  low:      { label: "Low",      color: "#00ffaa", bg: "rgba(0,255,170,0.12)"   },
};

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
      </div>
      <div className="text-center">
        <span className="font-mono text-xl font-bold text-white">{riskScore}</span>
        <span className="text-xs text-slate-500 font-medium">/100</span>
      </div>
    </div>
  );
}

function FlagRow({ flag }: { flag: Flag }) {
  const cfg = RISK_CONFIG[flag.risk];

  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0 text-xs">
      <div className="min-w-0 flex-1 pr-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-slate-500">{flag.sku}</span>
          <span className="font-semibold text-slate-200 truncate">{flag.product}</span>
        </div>
        <p className="text-[10px] text-slate-400 truncate mt-0.5" title={flag.claim}>{flag.claim}</p>
      </div>
      <span
        className="text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
        style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.color}30` }}
      >
        {cfg.label}
      </span>
    </div>
  );
}

export function GreenwashingRiskCard() {
  const { state } = useApp();
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 400);
    return () => clearTimeout(t);
  }, []);

  let riskScore = 48;
  let riskLevel = "Medium";
  let subtitle = state.filename ? `Active Report: ${state.filename}` : "PDF Sustainability Risk Analysis";
  let badgeColor = "#ffb300";

  let flags: Flag[] = [];

  if (state.greenwashing?.report) {
    const r = state.greenwashing.report;
    riskScore = r.risk_score;
    riskLevel = r.risk_level;
    subtitle = `Report: ${r.filename}`;
    badgeColor = r.risk_color;

    if (r.reasons && r.reasons.length > 0) {
      flags = r.reasons.map((res, i) => ({
        id: String(i + 1),
        sku: `P. ${i + 1}`,
        product: res.title,
        claim: res.description || "Identified risk signal in document disclosure",
        risk: (res.severity in RISK_CONFIG ? res.severity : "medium") as RiskLevel,
        detected: "Analyzed",
      }));
    }
  }

  if (flags.length === 0) {
    // Extract flags from unverified claims in analysis or DEMO_RESULTS
    const rejectedClaims = state.verification?.results?.filter(r => r.verdict === "not_verified")
      || DEMO_RESULTS.claims.rejected_list;

    flags = rejectedClaims.map((item: any, i: number) => ({
      id: String(i + 1),
      sku: `P. ${item.page || 1}`,
      product: item.category ? `${item.category.toUpperCase()} Disclosure` : `Risk Signal ${i + 1}`,
      claim: item.claim || item.text || "Unverified sustainability claim",
      risk: (item.confidence < 0.2 ? "critical" : item.confidence < 0.4 ? "high" : "medium") as RiskLevel,
      detected: "Analyzed",
    }));
  }

  const distribution = [
    { level: "critical" as RiskLevel, count: flags.filter(f => f.risk === "critical").length, pct: 20 },
    { level: "high"     as RiskLevel, count: flags.filter(f => f.risk === "high").length,     pct: 30 },
    { level: "medium"   as RiskLevel, count: flags.filter(f => f.risk === "medium").length,   pct: 35 },
    { level: "low"      as RiskLevel, count: flags.filter(f => f.risk === "low").length,      pct: 15 },
  ];

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
          {riskLevel} Risk
        </span>
      </div>

      {/* Gauge */}
      <div className="flex items-center justify-center py-2">
        <RiskGauge riskScore={riskScore} animated={animated} />
      </div>

      {/* Distribution */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] text-slate-500 mb-1">
          <span>Risk Distribution ({flags.length} signals)</span>
          <span>Level: {riskLevel}</span>
        </div>
        <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
          {distribution.map((d) => (
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
      <div className="mt-1 flex-1 overflow-y-auto max-h-[180px]">
        <p className="text-[11px] font-semibold text-slate-400 mb-2">Detected Risk Signals & Evidence ({flags.length})</p>
        <div>
          {flags.map((flag) => (
            <FlagRow key={flag.id} flag={flag} />
          ))}
        </div>
      </div>
    </div>
  );
}
