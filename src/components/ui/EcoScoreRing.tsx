/**
 * EcoLabel X — EcoScore Ring Component
 * Animated circular progress indicator for eco scores.
 */
import { cn } from "@/lib/utils/cn";
import { ECO_SCORE_COLORS, ECO_SCORE_THRESHOLDS } from "@/lib/constants";

interface EcoScoreRingProps {
  score:        number;   // 0–100
  size?:        "sm" | "md" | "lg" | "xl";
  showLabel?:   boolean;
  className?:   string;
  animated?:    boolean;
}

const sizeCfg = {
  sm: { dim: 64,  strokeW: 5,  fontSize: "text-lg",  labelSize: "text-[9px]"  },
  md: { dim: 96,  strokeW: 6,  fontSize: "text-2xl",  labelSize: "text-[10px]" },
  lg: { dim: 128, strokeW: 7,  fontSize: "text-3xl",  labelSize: "text-xs"     },
  xl: { dim: 176, strokeW: 8,  fontSize: "text-4xl",  labelSize: "text-sm"     },
};

function getTierColor(score: number): string {
  if (score >= ECO_SCORE_THRESHOLDS.platinum) return ECO_SCORE_COLORS.platinum;
  if (score >= ECO_SCORE_THRESHOLDS.gold)     return ECO_SCORE_COLORS.gold;
  if (score >= ECO_SCORE_THRESHOLDS.silver)   return ECO_SCORE_COLORS.silver;
  if (score >= ECO_SCORE_THRESHOLDS.bronze)   return ECO_SCORE_COLORS.bronze;
  return "#ef4444";
}

function getTierLabel(score: number): string {
  if (score >= ECO_SCORE_THRESHOLDS.platinum) return "Platinum";
  if (score >= ECO_SCORE_THRESHOLDS.gold)     return "Gold";
  if (score >= ECO_SCORE_THRESHOLDS.silver)   return "Silver";
  if (score >= ECO_SCORE_THRESHOLDS.bronze)   return "Bronze";
  return "Low";
}

export function EcoScoreRing({
  score,
  size      = "md",
  showLabel = true,
  className,
  animated  = true,
}: EcoScoreRingProps) {
  const { dim, strokeW, fontSize, labelSize } = sizeCfg[size];
  const color = getTierColor(score);
  const tier  = getTierLabel(score);

  const radius        = (dim / 2) - strokeW - 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset    = circumference * (1 - score / 100);
  const center        = dim / 2;

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: dim, height: dim }}
      role="meter"
      aria-label={`Eco Score: ${score} out of 100 — ${tier}`}
      aria-valuenow={score}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <svg
        width={dim}
        height={dim}
        viewBox={`0 0 ${dim} ${dim}`}
        className="-rotate-90"
      >
        {/* Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeW}
        />
        {/* Progress */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeW}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{
            filter: `drop-shadow(0 0 8px ${color}80)`,
            transition: animated ? "stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)" : undefined,
          }}
        />
      </svg>

      {/* Center Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={cn("font-display font-bold leading-none", fontSize)}
          style={{ color }}
        >
          {Math.round(score)}
        </span>
        {showLabel && (
          <span
            className={cn("font-medium uppercase tracking-widest mt-0.5", labelSize)}
            style={{ color: `${color}99` }}
          >
            {tier}
          </span>
        )}
      </div>
    </div>
  );
}
