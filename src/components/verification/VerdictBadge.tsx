/**
 * EcoLabel X — Verification Module: Verdict Badge
 */
"use client";

import { VERDICT_CONFIG, type Verdict } from "./types";

interface VerdictBadgeProps {
  verdict: Verdict;
  size?:   "sm" | "md" | "lg";
}

export function VerdictBadge({ verdict, size = "md" }: VerdictBadgeProps) {
  const cfg = VERDICT_CONFIG[verdict];

  const padding  = size === "lg" ? "px-4 py-1.5" : size === "sm" ? "px-2 py-0.5" : "px-3 py-1";
  const textSize = size === "lg" ? "text-sm"     : size === "sm" ? "text-[10px]"  : "text-[11px]";

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full font-bold tracking-wide ${padding} ${textSize}`}
      style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}
      title={cfg.description}
      role="status"
      aria-label={`Verdict: ${cfg.label}`}
    >
      <span aria-hidden="true" className="font-mono">{cfg.icon}</span>
      {cfg.label}
    </div>
  );
}
