/**
 * EcoLabel X — Input Component
 * Styled form input with icon support and error states.
 */
import { type InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?:      string;
  error?:      string;
  hint?:       string;
  leftIcon?:   React.ReactNode;
  rightIcon?:  React.ReactNode;
  fullWidth?:  boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className={cn("flex flex-col gap-1.5", fullWidth && "w-full")}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-slate-300"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-slate-500 pointer-events-none">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={cn(
              // Base
              "w-full text-sm text-white placeholder:text-slate-600",
              "bg-[rgba(255,255,255,0.04)] border rounded-xl",
              "px-4 py-2.5",
              "transition-all duration-200",
              "outline-none",
              // Border
              error
                ? "border-red-500/60 focus:border-red-400 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]"
                : "border-[rgba(255,255,255,0.10)] focus:border-[rgba(0,255,170,0.5)] focus:shadow-[0_0_0_3px_rgba(0,255,170,0.08)]",
              // Hover
              "hover:border-[rgba(255,255,255,0.18)]",
              // Icons
              leftIcon  && "pl-10",
              rightIcon && "pr-10",
              className
            )}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 text-slate-500">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p className="text-xs text-red-400 flex items-center gap-1">
            <span aria-hidden="true">⚠</span>
            {error}
          </p>
        )}

        {hint && !error && (
          <p className="text-xs text-slate-500">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
