/**
 * EcoLabel X — Greenwashing Analyzer: Risk Gauge
 * SVG arc gauge displaying 0-100 risk score with colour-matched needle.
 */
"use client";

import { RISK_CONFIG, type RiskLevel } from "./types";

interface RiskGaugeProps {
  score:      number;     // 0–100
  riskLevel:  RiskLevel;
  animated?:  boolean;
}

const R   = 80;          // radius
const CX  = 100;         // centre x
const CY  = 100;         // centre y
const SW  = 14;          // stroke width
const GAP = 30;          // degrees cut from bottom of arc

/** Convert degrees to SVG arc path point (0° = top, clockwise) */
function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

/** Build SVG arc path between two angles */
function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const s    = polar(cx, cy, r, startDeg);
  const e    = polar(cx, cy, r, endDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
}

export function RiskGauge({ score, riskLevel, animated = true }: RiskGaugeProps) {
  const cfg = RISK_CONFIG[riskLevel];

  // Arc spans from GAP/2 (bottom-left) to 360-GAP/2 (bottom-right)
  const startDeg = 90 + GAP / 2;
  const endDeg   = 90 - GAP / 2 + 360;
  const arcSpan  = 360 - GAP;

  // Score needle angle
  const needleDeg = startDeg + (score / 100) * arcSpan;

  // Track (background) arc
  const trackPath = arcPath(CX, CY, R, startDeg, endDeg - 0.01);

  // Fill arc (coloured)
  const fillEnd   = startDeg + (score / 100) * arcSpan;
  const fillPath  = score > 0 ? arcPath(CX, CY, R, startDeg, fillEnd - 0.01) : "";

  // Needle tip
  const needleTip = polar(CX, CY, R - SW / 2 - 4, needleDeg);

  // Zone arcs (Low/Medium/High/Critical bands)
  const zones = [
    { from: 0,  to: 25, color: "#00ffaa" },
    { from: 25, to: 50, color: "#ffb300" },
    { from: 50, to: 75, color: "#f97316" },
    { from: 75, to: 100, color: "#ef4444" },
  ];

  return (
    <div className="flex flex-col items-center" aria-label={`Risk gauge: ${score}/100 ${riskLevel}`}>
      <svg
        viewBox="0 0 200 130"
        className="w-52 h-36"
        role="img"
        aria-label={`Risk score ${score} out of 100`}
      >
        <defs>
          <filter id="glow-gauge">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Track */}
        <path d={trackPath} fill="none" stroke="rgba(255,255,255,0.07)"
              strokeWidth={SW} strokeLinecap="round" />

        {/* Zone bands (thin, inner) */}
        {zones.map((z) => {
          const zStart = startDeg + (z.from / 100) * arcSpan;
          const zEnd   = startDeg + (z.to   / 100) * arcSpan;
          return (
            <path key={z.from}
              d={arcPath(CX, CY, R - SW * 0.9, zStart, zEnd - 0.01)}
              fill="none" stroke={z.color} strokeWidth={2} opacity={0.25}
              strokeLinecap="butt"
            />
          );
        })}

        {/* Fill arc */}
        {fillPath && (
          <path d={fillPath} fill="none" stroke={cfg.color}
                strokeWidth={SW} strokeLinecap="round"
                filter="url(#glow-gauge)"
                style={animated ? { transition: "stroke-dashoffset 1s ease" } : undefined}
          />
        )}

        {/* Needle */}
        <line
          x1={CX} y1={CY}
          x2={needleTip.x} y2={needleTip.y}
          stroke={cfg.color} strokeWidth={2.5} strokeLinecap="round"
          filter="url(#glow-gauge)"
        />
        <circle cx={CX} cy={CY} r={5} fill={cfg.color} />

        {/* Score label */}
        <text x={CX} y={CY + 20} textAnchor="middle" fill="white"
              fontSize={22} fontWeight={700} fontFamily="var(--font-display, sans-serif)">
          {score}
        </text>
        <text x={CX} y={CY + 33} textAnchor="middle" fill={cfg.color}
              fontSize={8} fontWeight={600} letterSpacing={1}>
          / 100
        </text>

        {/* Zone labels */}
        <text x={22} y={118} textAnchor="middle" fill="#00ffaa" fontSize={7} opacity={0.7}>LOW</text>
        <text x={178} y={118} textAnchor="middle" fill="#ef4444" fontSize={7} opacity={0.7}>CRIT</text>
      </svg>

      {/* Risk level badge */}
      <div
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold -mt-1"
        style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}
      >
        <span aria-hidden="true">{cfg.icon}</span>
        {riskLevel} Risk
      </div>
    </div>
  );
}
