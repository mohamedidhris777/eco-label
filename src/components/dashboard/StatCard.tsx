/**
 * EcoLabel X — StatCard Component
 * Dashboard metric card with trend indicator.
 */
import { cn } from "@/lib/utils/cn";
import { formatDelta } from "@/lib/utils/formatters";
import type { StatCard as StatCardType } from "@/types";

interface StatCardProps extends StatCardType {
  className?: string;
}

const colorMap = {
  green:  { text: "text-[#00ffaa]", bg: "bg-[rgba(0,255,170,0.08)]", border: "border-[rgba(0,255,170,0.15)]", glow: "rgba(0,255,170,0.12)" },
  blue:   { text: "text-[#00c8ff]", bg: "bg-[rgba(0,200,255,0.08)]", border: "border-[rgba(0,200,255,0.15)]", glow: "rgba(0,200,255,0.12)" },
  purple: { text: "text-[#9b59ff]", bg: "bg-[rgba(155,89,255,0.08)]", border: "border-[rgba(155,89,255,0.15)]", glow: "rgba(155,89,255,0.12)" },
  amber:  { text: "text-[#ffb300]", bg: "bg-[rgba(255,179,0,0.08)]", border: "border-[rgba(255,179,0,0.15)]", glow: "rgba(255,179,0,0.12)" },
};

export function StatCard({
  label,
  value,
  unit,
  delta,
  deltaLabel,
  icon,
  color = "green",
  className,
}: StatCardProps) {
  const palette = colorMap[color];
  const isPositive = delta !== undefined && delta >= 0;

  return (
    <div
      className={cn(
        "relative rounded-2xl p-6 overflow-hidden",
        "bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)]",
        "backdrop-blur-xl",
        "hover:-translate-y-0.5 hover:border-[rgba(255,255,255,0.12)]",
        "transition-all duration-250",
        className
      )}
    >
      {/* Background glow */}
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl pointer-events-none"
        style={{ background: palette.glow, transform: "translate(50%, -50%)" }}
      />

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4 relative">
        <p className="text-sm text-slate-500 font-medium">{label}</p>
        {icon && (
          <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border", palette.bg, palette.border)}>
            <span className={cn("text-base", palette.text)}>{icon}</span>
          </div>
        )}
      </div>

      {/* Value */}
      <div className="flex items-end gap-1.5 mb-3 relative">
        <span className={cn("font-display font-bold text-3xl", palette.text)}>
          {value}
        </span>
        {unit && (
          <span className="text-slate-500 text-sm mb-1">{unit}</span>
        )}
      </div>

      {/* Delta */}
      {delta !== undefined && (
        <div className="flex items-center gap-2 relative">
          <span
            className={cn(
              "inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full",
              isPositive
                ? "bg-[rgba(0,255,170,0.1)] text-[#00ffaa]"
                : "bg-[rgba(239,68,68,0.1)] text-red-400"
            )}
          >
            <span aria-hidden="true">{isPositive ? "↑" : "↓"}</span>
            {formatDelta(Math.abs(delta))}
          </span>
          {deltaLabel && (
            <span className="text-xs text-slate-600">{deltaLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}
