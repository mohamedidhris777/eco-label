/**
 * EcoLabel X — Results Module: Trust Score Gauge
 * Large SVG arc gauge with animated fill, gradient stroke, and pulsing glow.
 */
"use client";

import { useEffect, useRef } from "react";
import { trustColor } from "./types";

interface TrustScoreGaugeProps {
  score: number;  // 0–100
}

const CX = 120; const CY = 120; const R = 95; const SW = 18;
const START_DEG = 135; const END_DEG = 405; const ARC_SPAN = 270;

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(startDeg: number, endDeg: number, r: number) {
  const s = polar(CX, CY, r, startDeg);
  const e = polar(CX, CY, r, endDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
}

export function TrustScoreGauge({ score }: TrustScoreGaugeProps) {
  const color    = trustColor(score);
  const fillEnd  = START_DEG + (score / 100) * ARC_SPAN;
  const trackPath = arcPath(START_DEG, END_DEG - 0.01, R);
  const fillPath  = score > 0 ? arcPath(START_DEG, fillEnd - 0.01, R) : "";

  const grade =
    score >= 80 ? "A" :
    score >= 65 ? "B" :
    score >= 50 ? "C" :
    score >= 35 ? "D" : "F";

  const label =
    score >= 70 ? "Trustworthy" :
    score >= 50 ? "Moderate"   :
    score >= 30 ? "Questionable" : "High Risk";

  // Circumference for dash animation
  const arcCirc = (ARC_SPAN / 360) * 2 * Math.PI * R;
  const dashOffset = arcCirc * (1 - score / 100);
  const fillRef = useRef<SVGPathElement>(null);
  useEffect(() => {
    const el = fillRef.current;
    if (!el) return;
    el.style.strokeDasharray  = `${arcCirc}`;
    el.style.strokeDashoffset = `${arcCirc}`;
    requestAnimationFrame(() => {
      el.style.transition       = "stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)";
      el.style.strokeDashoffset = String(dashOffset);
    });
  }, [arcCirc, dashOffset]);

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 240 220" className="w-52 h-44" aria-label={`Trust score: ${score} out of 100`} role="img">
        <defs>
          <linearGradient id="trust-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#9b59ff" />
            <stop offset="100%" stopColor={color} />
          </linearGradient>
          <filter id="trust-glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Track */}
        <path d={trackPath} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={SW} strokeLinecap="round" />

        {/* Zone ticks */}
        {[0, 30, 50, 70, 100].map((v) => {
          const deg = START_DEG + (v / 100) * ARC_SPAN;
          const inner = polar(CX, CY, R - SW / 2 - 4, deg);
          const outer = polar(CX, CY, R + SW / 2 + 2, deg);
          return (
            <line key={v} x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y}
              stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
          );
        })}

        {/* Fill arc */}
        {fillPath && (
          <path ref={fillRef} d={fillPath} fill="none" stroke="url(#trust-grad)"
            strokeWidth={SW} strokeLinecap="round" filter="url(#trust-glow)" />
        )}

        {/* Grade letter */}
        <text x={CX} y={CY - 8} textAnchor="middle" fill={color}
          fontSize={52} fontWeight={800} fontFamily="var(--font-display, sans-serif)">
          {grade}
        </text>

        {/* Score number */}
        <text x={CX} y={CY + 26} textAnchor="middle" fill="rgba(255,255,255,0.5)"
          fontSize={14} fontWeight={500}>
          {score}<tspan fontSize={10}>/100</tspan>
        </text>

        {/* Label */}
        <text x={CX} y={CY + 46} textAnchor="middle" fill={color}
          fontSize={11} fontWeight={600} letterSpacing={0.5}>
          {label}
        </text>
      </svg>

      {/* Subscript */}
      <p className="text-[9px] uppercase tracking-widest text-slate-600 -mt-1">Trust Score</p>
    </div>
  );
}
