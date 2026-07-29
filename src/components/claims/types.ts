/**
 * EcoLabel X — Claims Module: TypeScript types
 * Mirrors the backend ClaimDetectionResponse schema exactly.
 */

export type ClaimCategory =
  | "carbon"
  | "renewable_energy"
  | "recycling"
  | "water"
  | "biodiversity"
  | "supply_chain"
  | "packaging"
  | "certification"
  | "targets";

export interface ClaimResult {
  claim:            string;
  page:             number;
  confidence:       number;  // 0–1
  category:         ClaimCategory;
  keywords_matched: string[];
}

export interface ClaimsSummary {
  total_claims:          number;
  by_category:           Record<ClaimCategory, number>;
  avg_confidence:        number;
  high_confidence_count: number;
  pages_with_claims:     number[];
}

export interface ClaimDetectionResponse {
  success:    boolean;
  filename:   string;
  size_bytes: number;
  page_count: number;
  claims:     ClaimResult[];
  summary:    ClaimsSummary;
}

// ─── UI display config per category ──────────────────────────────────────────

export interface CategoryConfig {
  label:       string;
  color:       string;   // hex accent
  bg:          string;   // rgba background
  border:      string;   // rgba border
  icon:        string;   // emoji
}

export const CATEGORY_CONFIG: Record<ClaimCategory, CategoryConfig> = {
  carbon:           { label: "Carbon",          color: "#00ffaa", bg: "rgba(0,255,170,0.1)",  border: "rgba(0,255,170,0.25)",  icon: "🌿" },
  renewable_energy: { label: "Renewable Energy", color: "#00c8ff", bg: "rgba(0,200,255,0.1)",  border: "rgba(0,200,255,0.25)",  icon: "⚡" },
  recycling:        { label: "Recycling",        color: "#14b8a6", bg: "rgba(20,184,166,0.1)", border: "rgba(20,184,166,0.25)", icon: "♻️" },
  water:            { label: "Water",            color: "#22d3ee", bg: "rgba(34,211,238,0.1)", border: "rgba(34,211,238,0.25)", icon: "💧" },
  biodiversity:     { label: "Biodiversity",     color: "#4ade80", bg: "rgba(74,222,128,0.1)", border: "rgba(74,222,128,0.25)", icon: "🌱" },
  supply_chain:     { label: "Supply Chain",     color: "#9b59ff", bg: "rgba(155,89,255,0.1)", border: "rgba(155,89,255,0.25)", icon: "🔗" },
  packaging:        { label: "Packaging",        color: "#fb923c", bg: "rgba(251,146,60,0.1)", border: "rgba(251,146,60,0.25)", icon: "📦" },
  certification:    { label: "Certification",    color: "#ffb300", bg: "rgba(255,179,0,0.1)",  border: "rgba(255,179,0,0.25)",  icon: "🏅" },
  targets:          { label: "Targets",          color: "#ff6b9d", bg: "rgba(255,107,157,0.1)",border: "rgba(255,107,157,0.25)",icon: "🎯" },
};

export const ALL_CATEGORIES = Object.keys(CATEGORY_CONFIG) as ClaimCategory[];
