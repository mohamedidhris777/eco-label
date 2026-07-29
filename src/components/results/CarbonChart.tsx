/**
 * EcoLabel X — Results Module: Carbon Chart
 * Grouped horizontal bars (target vs actual) for Scope 1, 2, 3 + overall ring.
 */
"use client";

import { useEffect, useRef } from "react";
import { carbonColor, type CarbonScore } from "./types";

interface CarbonChartProps { carbon: CarbonScore; }

interface AnimatedBarProps {
  label:    string;
  target:   number;
  actual:   number;
  color:    string;
  baseline: number;
  year:     number;
}

function AnimatedBar({ label, target, actual, color, baseline, year }: AnimatedBarProps) {
  const actualRef  = useRef<HTMLDivElement>(null);
  const targetRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const delay = 200;
    const timer = setTimeout(() => {
      if (actualRef.current)
        actualRef.current.style.width = `${Math.min(actual, 100)}%`;
      if (targetRef.current)
        targetRef.current.style.width = `${Math.min(target, 100)}%`;
    }, delay);
    return () => clearTimeout(timer);
  }, [actual, target]);

  const ahead = actual >= target * 0.9;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[11px]">
        <span className="font-semibold text-slate-300">{label}</span>
        <div className="flex items-center gap-3">
          <span className="text-slate-600 text-[10px]">Target {target}% by {year}</span>
          <span className="font-bold tabular-nums" style={{ color }}>
            {actual}%
            <span className="ml-1 text-[9px]">{ahead ? "✓ On track" : "⚠ Lagging"}</span>
          </span>
        </div>
      </div>

      {/* Track */}
      <div className="relative h-2.5 rounded-full overflow-hidden"
           style={{ background: "rgba(255,255,255,0.06)" }}>
        {/* Target marker */}
        <div className="absolute top-0 bottom-0 w-0.5 bg-white opacity-20 z-10"
             style={{ left: `${target}%` }} title={`Target: ${target}%`} />
        {/* Actual bar */}
        <div
          ref={actualRef}
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: 0,
            background: `linear-gradient(90deg, ${color}88, ${color})`,
            boxShadow:  `0 0 8px ${color}60`,
          }}
        />
      </div>

      <p className="text-[9px] text-slate-700">vs {baseline} baseline</p>
    </div>
  );
}

export function CarbonChart({ carbon }: CarbonChartProps) {
  const oc = carbonColor(carbon.overall);

  // Ring path
  const R = 36; const CX = 44; const CY = 44;
  const circ = 2 * Math.PI * R;
  const offset = circ * (1 - carbon.overall / 100);
  const ringRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const el = ringRef.current;
    if (!el) return;
    el.style.strokeDasharray  = String(circ);
    el.style.strokeDashoffset = String(circ);
    const t = setTimeout(() => {
      el.style.transition       = "stroke-dashoffset 1s ease-out";
      el.style.strokeDashoffset = String(offset);
    }, 100);
    return () => clearTimeout(t);
  }, [circ, offset]);

  return (
    <div className="space-y-5">
      {/* Score summary row */}
      <div className="flex items-center gap-5">
        {/* Mini ring */}
        <svg viewBox="0 0 88 88" className="w-20 h-20 flex-shrink-0" aria-label={`Carbon score ${carbon.overall}`}>
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={8} />
          <circle ref={ringRef} cx={CX} cy={CY} r={R} fill="none" stroke={oc}
            strokeWidth={8} strokeLinecap="round"
            transform={`rotate(-90 ${CX} ${CY})`}
            style={{ filter: `drop-shadow(0 0 6px ${oc}80)` }}
          />
          <text x={CX} y={CY + 5} textAnchor="middle" fill={oc}
            fontSize={16} fontWeight={800} fontFamily="sans-serif">
            {carbon.overall}
          </text>
        </svg>

        <div>
          <p className="text-[9px] uppercase tracking-widest text-slate-600 mb-0.5">Carbon Score</p>
          <p className="text-2xl font-display font-bold" style={{ color: oc }}>
            {carbon.overall}<span className="text-sm text-slate-500 font-normal">/100</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {carbon.reduction_pct}% overall emissions reduction achieved
          </p>
        </div>
      </div>

      {/* Scope bars */}
      <div className="space-y-4">
        {carbon.scopes.map((scope) => (
          <AnimatedBar
            key={scope.label}
            label={scope.label}
            target={scope.target}
            actual={scope.actual}
            color={carbonColor(scope.actual / scope.target * 100)}
            baseline={scope.baseline}
            year={scope.target_year}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-[9px] text-slate-600">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-1 bg-white opacity-20 rounded" />
          Target threshold
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-1 rounded" style={{ background: "#60a5fa" }} />
          Actual reduction
        </div>
      </div>
    </div>
  );
}
