/**
 * EcoLabel X — Card Component
 * Glassmorphism container with multiple elevation levels.
 */
import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type CardVariant = "default" | "elevated" | "bordered" | "flat";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?:     CardVariant;
  hoverable?:   boolean;
  noPadding?:   boolean;
  glowOnHover?: boolean;
}

const variantStyles: Record<CardVariant, string> = {
  default: [
    "bg-[rgba(255,255,255,0.04)]",
    "border border-[rgba(255,255,255,0.08)]",
    "backdrop-blur-xl",
    "shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)]",
  ].join(" "),

  elevated: [
    "bg-[rgba(255,255,255,0.06)]",
    "border border-[rgba(255,255,255,0.12)]",
    "backdrop-blur-2xl",
    "shadow-[0_16px_48px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)]",
  ].join(" "),

  bordered: [
    "bg-transparent",
    "border border-[rgba(0,255,170,0.2)]",
    "shadow-[0_0_0_1px_rgba(0,255,170,0.05)]",
  ].join(" "),

  flat: [
    "bg-[#0a1228]",
    "border border-[rgba(255,255,255,0.06)]",
  ].join(" "),
};

export function Card({
  variant      = "default",
  hoverable    = false,
  noPadding    = false,
  glowOnHover  = false,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl",
        variantStyles[variant],
        !noPadding && "p-6",
        hoverable && [
          "transition-all duration-250 ease-out",
          "hover:-translate-y-1",
          "hover:bg-[rgba(255,255,255,0.07)]",
          "hover:border-[rgba(255,255,255,0.14)]",
        ],
        glowOnHover && [
          "hover:shadow-[0_16px_48px_rgba(0,0,0,0.5),0_0_32px_rgba(0,255,170,0.08),inset_0_1px_0_rgba(255,255,255,0.08)]",
        ],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// ─── Subcomponents ────────────────────────────────────────────────────────────

export function CardHeader({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 mb-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("font-display font-semibold text-white text-lg leading-tight", className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm text-slate-400 leading-relaxed", className)}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardFooter({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 mt-6 pt-4 border-t border-[rgba(255,255,255,0.06)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
