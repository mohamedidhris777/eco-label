/**
 * EcoLabel X — Formatter Utilities
 */

/** Format a number as compact (e.g. 1200 → "1.2K") */
export function formatCompact(value: number): string {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

/** Format a carbon value with appropriate units */
export function formatCarbon(kg: number): string {
  if (kg >= 1000) {
    return `${(kg / 1000).toFixed(2)} tCO₂e`;
  }
  return `${kg.toFixed(1)} kgCO₂e`;
}

/** Format an ISO date string to a human-readable date */
export function formatDate(
  iso: string,
  options: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" }
): string {
  return new Intl.DateTimeFormat("en-US", options).format(new Date(iso));
}

/** Format a percentage with a sign prefix */
export function formatDelta(delta: number): string {
  const sign = delta >= 0 ? "+" : "";
  return `${sign}${delta.toFixed(1)}%`;
}

/** Format an eco score (0–100) */
export function formatEcoScore(score: number): string {
  return `${Math.round(score)}/100`;
}

/** Truncate a string to a max length */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength - 3)}…`;
}

/** Slugify a string */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .trim();
}
