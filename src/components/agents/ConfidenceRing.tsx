/**
 * EcoLabel X — AI Mission Control: Confidence Ring
 *
 * An animated SVG arc showing the agent's confidence score (0–100).
 * Draws with a glow filter and a subtle track ring.
 */
"use client";

import { useEffect, useState } from "react";

interface ConfidenceRingProps {
  value:   number;    // 0–100
  color:   string;    // hex accent
  size?:   number;    // pixel diameter (default 88)
  stroke?: number;    // stroke width (default 7)
}

export function ConfidenceRing({
  value,
  color,
  size   = 88,
  stroke = 7,
}: ConfidenceRingProps) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 150);
    return () => clearTimeout(t);
  }, []);

  const r    = (size / 2) - stroke - 2;
  const circ = 2 * Math.PI * r;
  const dash = animated ? circ * (value / 100) : 0;
  const gap  = circ - dash;

  // Colour shifts: green > 80, amber 60-80, red < 60
  const displayColor =
    value >= 80 ? color :
    value >= 60 ? "#ffb300" :
                  "#ef4444";

  const filterId = `glow-${color.replace("#", "")}`;

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden="true">
        <defs>
          <filter id={filterId} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Track */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={stroke}
        />

        {/* Tick marks */}
        {[0, 25, 50, 75].map((pct) => {
          const angle  = (pct / 100) * 360 - 90;
          const rad    = (angle * Math.PI) / 180;
          const inner  = r - stroke / 2 - 2;
          const outer  = r + stroke / 2 + 2;
          const x1     = size / 2 + inner * Math.cos(rad);
          const y1     = size / 2 + inner * Math.sin(rad);
          const x2     = size / 2 + outer * Math.cos(rad);
          const y2     = size / 2 + outer * Math.sin(rad);
          return (
            <line key={pct} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
          );
        })}

        {/* Arc */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke={displayColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${gap}`}
          filter={`url(#${filterId})`}
          style={{
            transition: "stroke-dasharray 0.8s cubic-bezier(0.4,0,0.2,1), stroke 0.5s",
          }}
        />
      </svg>

      {/* Centre label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-display font-bold leading-none"
          style={{
            fontSize:   size < 80 ? 18 : 22,
            color:      displayColor,
            transition: "color 0.5s",
          }}
        >
          {Math.round(value)}
        </span>
        <span className="text-[9px] uppercase tracking-widest text-slate-600 mt-0.5">
          conf.
        </span>
      </div>
    </div>
  );
}
