/**
 * EcoLabel X — Badge Component
 * Compact status indicator with multiple variants.
 */
import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "purple";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?:  BadgeVariant;
  dot?:      boolean;
  pill?:     boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-slate-500/20 text-slate-300 border-slate-500/30",
  success: "bg-[rgba(0,255,170,0.12)] text-[#00ffaa] border-[rgba(0,255,170,0.3)]",
  warning: "bg-[rgba(255,179,0,0.12)] text-[#ffb300] border-[rgba(255,179,0,0.3)]",
  danger:  "bg-[rgba(239,68,68,0.12)] text-red-400 border-[rgba(239,68,68,0.3)]",
  info:    "bg-[rgba(0,200,255,0.12)] text-[#00c8ff] border-[rgba(0,200,255,0.3)]",
  purple:  "bg-[rgba(155,89,255,0.12)] text-[#9b59ff] border-[rgba(155,89,255,0.3)]",
};

const dotColors: Record<BadgeVariant, string> = {
  default: "bg-slate-400",
  success: "bg-[#00ffaa]",
  warning: "bg-[#ffb300]",
  danger:  "bg-red-400",
  info:    "bg-[#00c8ff]",
  purple:  "bg-[#9b59ff]",
};

export function Badge({
  variant = "default",
  dot     = false,
  pill    = true,
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5",
        "px-2.5 py-0.5 text-xs font-medium",
        "border",
        variantStyles[variant],
        pill ? "rounded-full" : "rounded-md",
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", dotColors[variant])}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}
