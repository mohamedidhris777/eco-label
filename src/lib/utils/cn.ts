/**
 * EcoLabel X — Class Name Utility
 * Merges Tailwind classes with conflict resolution.
 */
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
