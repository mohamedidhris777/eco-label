/**
 * EcoLabel X — Carbon Score Card
 *
 * Total CO₂e figure, Scope 1/2/3 breakdown bars,
 * a mini sparkline trend chart, and category distribution.
 */
"use client";

import { useEffect, useState } from "react";

// ─── Mini Sparkline ───────────────────────────────────────────────────────────

const SPARKLINE_DATA = [42, 38, 45, 41, 36, 33, 29, 27, 31, 28, 25, 24];

function Sparkline({ animated }: { animated: boolean }) {
  const W = 200;
  const H = 48;
  const pad = 4;
  const max = Math.max(...SPARKLINE_DATA);
  const min = Math.min(...SPARKLINE_DATA);
  const range = max - min || 1;

  const pts = SPARKLINE_DATA.map((v, i) => {
    const x = pad + (i / (SPARKLINE_DATA.length - 1)) * (W - pad * 2);
    const y = H - pad - ((v - min) / range) * (H - pad * 2);
    return [x, y] as [number, number];
  });

  const polyline = pts.map((p) => p.join(",")).join(" ");

  // Build fill path
  const fill = `M ${pts[0][0]} ${H} ` +
    pts.map((p) => `L ${p[0]} ${p[1]}`).join(" ") +
    ` L ${pts[pts.length - 1][0]} ${H} Z`;

  return (
    <div className="relative" aria-label="Carbon trend over 12 months">
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#00ffaa" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#00ffaa" stopOpacity="0"    />
          </linearGradient>
        </defs>
        {/* Fill area */}
        <path d={fill} fill="url(#spark-fill)" />
        {/* Line */}
        <polyline
          points={polyline}
          fill="none"
          stroke="#00ffaa"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: "drop-shadow(0 0 4px rgba(0,255,170,0.5))" }}
        />
        {/* Last point dot */}
        <circle
          cx={pts[pts.length - 1][0]}
          cy={pts[pts.length - 1][1]}
          r="3"
          fill="#00ffaa"
          style={{ filter: "drop-shadow(0 0 6px rgba(0,255,170,0.8))" }}
        />
      </svg>
      <div className="flex justify-between text-[9px] text-slate-600 mt-0.5">
        <span>12 mo ago</span>
        <span>Now</span>
      </div>
    </div>
  );
}

// ─── Scope Bar ────────────────────────────────────────────────────────────────

function ScopeBar({
  scope, label, value, total, color, animated,
}: {
  scope: string; label: string; value: number; total: number; color: string; animated: boolean;
}) {
  const pct = (value / total) * 100;
  return (
    <div>
      <div className="flex items-center justify-between text-[11px] mb-1">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
          <span className="text-slate-400">{scope}</span>
          <span className="text-slate-600 hidden sm:inline">{label}</span>
        </div>
        <span className="font-medium text-white">{value.toLocaleString()} t</span>
      </div>
      <div className="h-1.5 rounded-full bg-[rgba(255,255,255,0.05)] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width:      animated ? `${pct}%` : "0%",
            background: `linear-gradient(90deg, ${color}, ${color}70)`,
            boxShadow:  `0 0 6px ${color}40`,
          }}
        />
      </div>
    </div>
  );
}

// ─── Category Donut ───────────────────────────────────────────────────────────

const CATEGORIES = [
  { name: "Transport",    pct: 38, color: "#00ffaa" },
  { name: "Manufacturing",pct: 29, color: "#00c8ff" },
  { name: "Raw Materials",pct: 18, color: "#9b59ff" },
  { name: "Packaging",    pct: 15, color: "#ffb300" },
] as const;

function CategoryDonut({ animated }: { animated: boolean }) {
  const size = 80;
  const sw   = 10;
  const r    = (size / 2) - sw / 2;
  const circ = 2 * Math.PI * r;

  let offset = 0;
  const slices = CATEGORIES.map((c) => {
    const dash   = (c.pct / 100) * circ;
    const gap    = circ - dash;
    const rotate = offset;
    offset += (c.pct / 100) * 360;
    return { ...c, dash, gap, rotate };
  });

  return (
    <div className="flex items-center gap-4">
      {/* Donut */}
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90 flex-shrink-0" aria-hidden="true">
        {slices.map((s, i) => (
          <circle
            key={i}
            cx={size/2} cy={size/2} r={r}
            fill="none"
            stroke={s.color}
            strokeWidth={sw}
            strokeDasharray={`${animated ? s.dash : 0} ${animated ? s.gap : circ}`}
            strokeDashoffset={-((s.rotate / 360) * circ)}
            style={{ transition: `stroke-dasharray 1s ease ${i * 150}ms` }}
          />
        ))}
      </svg>

      {/* Legend */}
      <div className="space-y-1.5 text-[10px]">
        {CATEGORIES.map((c) => (
          <div key={c.name} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: c.color }} />
            <span className="text-slate-500">{c.name}</span>
            <span className="font-medium ml-auto pl-2" style={{ color: c.color }}>{c.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

const SCOPES = [
  { scope: "Scope 1", label: "— Direct",      value: 820,  color: "#00ffaa" },
  { scope: "Scope 2", label: "— Energy",      value: 1340, color: "#00c8ff" },
  { scope: "Scope 3", label: "— Value chain", value: 3870, color: "#9b59ff" },
] as const;

const TOTAL = SCOPES.reduce((acc, s) => acc + s.value, 0);

export function CarbonScoreCard() {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 250);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-4 h-full"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display font-semibold text-white text-sm">Carbon Score</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Total portfolio footprint</p>
        </div>
        <span
          className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
          style={{ color: "#00ffaa", background: "rgba(0,255,170,0.1)", border: "1px solid rgba(0,255,170,0.2)" }}
        >
          ↓ −18% YoY
        </span>
      </div>

      {/* Total */}
      <div>
        <div className="flex items-end gap-1.5 mb-0.5">
          <span className="font-display font-bold text-4xl text-[#00ffaa]">
            {(TOTAL / 1000).toFixed(1)}
          </span>
          <span className="text-slate-400 text-sm mb-1.5">kt CO₂e / yr</span>
        </div>
        <p className="text-[10px] text-slate-600">Across {147} products · Methodology: GHG Protocol</p>
      </div>

      {/* Scope bars */}
      <div className="space-y-2.5">
        {SCOPES.map((s) => (
          <ScopeBar key={s.scope} {...s} total={TOTAL} animated={animated} />
        ))}
      </div>

      {/* Sparkline trend */}
      <div>
        <p className="text-[10px] text-slate-600 uppercase tracking-widest mb-2">12-month trend</p>
        <Sparkline animated={animated} />
      </div>

      {/* Category donut */}
      <div>
        <p className="text-[10px] text-slate-600 uppercase tracking-widest mb-2">By category</p>
        <CategoryDonut animated={animated} />
      </div>
    </div>
  );
}
