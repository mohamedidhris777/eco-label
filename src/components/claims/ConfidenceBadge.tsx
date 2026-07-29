/**
 * EcoLabel X — Claims Module: Confidence Badge
 * Small inline badge displaying a confidence percentage with colour coding.
 */
"use client";

interface ConfidenceBadgeProps {
  value: number;  // 0–1
  size?: "sm" | "md";
}

export function ConfidenceBadge({ value, size = "md" }: ConfidenceBadgeProps) {
  const pct = Math.round(value * 100);

  const color =
    pct >= 80 ? "#00ffaa" :
    pct >= 60 ? "#ffb300" :
                "#ef4444";

  const bg =
    pct >= 80 ? "rgba(0,255,170,0.1)" :
    pct >= 60 ? "rgba(255,179,0,0.1)" :
                "rgba(239,68,68,0.1)";

  const label =
    pct >= 80 ? "High" :
    pct >= 60 ? "Medium" :
                "Low";

  const textSize = size === "sm" ? "text-[10px]" : "text-[11px]";

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-semibold ${textSize}`}
      style={{ color, background: bg, border: `1px solid ${color}30` }}
      title={`Confidence: ${pct}% (${label})`}
      aria-label={`Confidence: ${pct}%`}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: color }}
        aria-hidden="true"
      />
      {pct}%
      <span className="opacity-60">{label}</span>
    </div>
  );
}
