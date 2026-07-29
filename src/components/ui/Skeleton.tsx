/**
 * EcoLabel X — Skeleton Component
 * Loading placeholder with shimmer animation.
 */
import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  width?:    string | number;
  height?:   string | number;
  rounded?:  "sm" | "md" | "lg" | "full";
  lines?:    number; // render multiple stacked lines
}

export function Skeleton({
  width,
  height,
  rounded  = "md",
  lines,
  className,
  style,
  ...props
}: SkeletonProps) {
  const radiusMap = {
    sm:   "rounded",
    md:   "rounded-lg",
    lg:   "rounded-2xl",
    full: "rounded-full",
  };

  if (lines && lines > 1) {
    return (
      <div className="flex flex-col gap-2" {...props}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "bg-[rgba(255,255,255,0.06)] animate-pulse",
              radiusMap[rounded],
              i === lines - 1 && "w-3/4", // last line shorter
              className
            )}
            style={{ height: height ?? "1rem", ...style }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bg-[rgba(255,255,255,0.06)] animate-pulse",
        radiusMap[rounded],
        className
      )}
      style={{ width, height: height ?? "1rem", ...style }}
      aria-hidden="true"
      {...props}
    />
  );
}

// ─── Skeleton Card Preset ─────────────────────────────────────────────────────
export function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.07)] p-6">
      <Skeleton height={24} className="mb-3 w-1/2" />
      <Skeleton lines={3} className="mb-4" />
      <div className="flex gap-3">
        <Skeleton width={80} height={32} rounded="full" />
        <Skeleton width={80} height={32} rounded="full" />
      </div>
    </div>
  );
}
