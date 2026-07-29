/**
 * EcoLabel X — Button Component
 * Primary interactive element with multiple variants.
 */
import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "glass";
type ButtonSize    = "xs" | "sm" | "md" | "lg" | "xl";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:    ButtonVariant;
  size?:       ButtonSize;
  isLoading?:  boolean;
  leftIcon?:   React.ReactNode;
  rightIcon?:  React.ReactNode;
  fullWidth?:  boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: [
    "bg-gradient-to-r from-[#00ffaa] to-[#00c8ff]",
    "text-[#050a18] font-semibold",
    "hover:brightness-110 hover:shadow-[0_0_24px_rgba(0,255,170,0.4)]",
    "active:brightness-95",
  ].join(" "),

  secondary: [
    "border border-[rgba(0,255,170,0.4)] text-[#00ffaa]",
    "bg-[rgba(0,255,170,0.06)]",
    "hover:bg-[rgba(0,255,170,0.12)] hover:border-[rgba(0,255,170,0.7)]",
    "hover:shadow-[0_0_16px_rgba(0,255,170,0.2)]",
  ].join(" "),

  ghost: [
    "text-slate-300",
    "hover:text-white hover:bg-[rgba(255,255,255,0.06)]",
  ].join(" "),

  danger: [
    "border border-red-500/40 text-red-400",
    "bg-red-500/10",
    "hover:bg-red-500/20 hover:border-red-500/70",
    "hover:shadow-[0_0_16px_rgba(239,68,68,0.2)]",
  ].join(" "),

  glass: [
    "bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.10)]",
    "backdrop-blur-xl text-white",
    "hover:bg-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.18)]",
  ].join(" "),
};

const sizeStyles: Record<ButtonSize, string> = {
  xs: "px-3 py-1.5 text-xs gap-1.5 rounded-md",
  sm: "px-4 py-2   text-sm gap-2   rounded-lg",
  md: "px-5 py-2.5 text-sm gap-2   rounded-xl",
  lg: "px-6 py-3   text-base gap-2.5 rounded-xl",
  xl: "px-8 py-4   text-lg gap-3   rounded-2xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant   = "primary",
      size      = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          // Base
          "inline-flex items-center justify-center",
          "font-medium cursor-pointer",
          "transition-all duration-200 ease-out",
          "select-none",
          // Variant & Size
          variantStyles[variant],
          sizeStyles[size],
          // Width
          fullWidth && "w-full",
          // Disabled
          isDisabled && "opacity-50 cursor-not-allowed pointer-events-none",
          className
        )}
        {...props}
      >
        {isLoading ? (
          <SpinnerIcon className={size === "xs" || size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"} />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";

// ─── Internal Spinner ─────────────────────────────────────────────────────────
function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("animate-spin", className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
