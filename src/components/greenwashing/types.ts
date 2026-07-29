/**
 * EcoLabel X — Greenwashing Analyzer: TypeScript types
 */

export type RiskLevel = "Low" | "Medium" | "High" | "Critical";
export type Severity  = "critical" | "high" | "medium" | "low";
export type Priority  = "critical" | "high" | "medium" | "low";

export interface GreenwashingReason {
  code:            string;
  title:           string;
  description:     string;
  severity:        Severity;
  affected_claims: number;
  category:        string;
}

export interface MissingEvidence {
  category: string;
  item:     string;
  priority: Priority;
}

export interface Recommendation {
  priority:  Priority;
  action:    string;
  rationale: string;
  category:  string;
}

export interface ClaimBreakdown {
  total:                      number;
  verified:                   number;
  partially_verified:         number;
  not_verified:               number;
  vague_claims:               number;
  quantitative_claims:        number;
  absolute_claims_unverified: number;
}

export interface ReportFlags {
  has_certifications: boolean;
  has_third_party:    boolean;
  has_timelines:      boolean;
}

export interface GreenwashingReport {
  filename:         string;
  risk_level:       RiskLevel;
  risk_score:       number;
  risk_color:       string;
  summary:          string;
  reasons:          GreenwashingReason[];
  missing_evidence: MissingEvidence[];
  recommendations:  Recommendation[];
  claim_breakdown:  ClaimBreakdown;
  flags:            ReportFlags;
}

export interface AnalyzePDFResponse {
  success:         boolean;
  page_count:      number;
  report:          GreenwashingReport;
  verified_claims?: any[];
  products?:        any[];
}

// ─── UI config ────────────────────────────────────────────────────────────────

export interface RiskConfig {
  label:       RiskLevel;
  color:       string;
  bg:          string;
  border:      string;
  glow:        string;
  icon:        string;
  description: string;
}

export const RISK_CONFIG: Record<RiskLevel, RiskConfig> = {
  Low: {
    label:       "Low",
    color:       "#00ffaa",
    bg:          "rgba(0,255,170,0.08)",
    border:      "rgba(0,255,170,0.3)",
    glow:        "0 0 30px rgba(0,255,170,0.15)",
    icon:        "🛡️",
    description: "Claims are generally well-supported with evidence",
  },
  Medium: {
    label:       "Medium",
    color:       "#ffb300",
    bg:          "rgba(255,179,0,0.08)",
    border:      "rgba(255,179,0,0.3)",
    glow:        "0 0 30px rgba(255,179,0,0.15)",
    icon:        "⚠️",
    description: "Some claims lack evidence or use vague language",
  },
  High: {
    label:       "High",
    color:       "#f97316",
    bg:          "rgba(249,115,22,0.08)",
    border:      "rgba(249,115,22,0.3)",
    glow:        "0 0 30px rgba(249,115,22,0.15)",
    icon:        "🔥",
    description: "Significant greenwashing signals detected",
  },
  Critical: {
    label:       "Critical",
    color:       "#ef4444",
    bg:          "rgba(239,68,68,0.08)",
    border:      "rgba(239,68,68,0.3)",
    glow:        "0 0 30px rgba(239,68,68,0.15)",
    icon:        "🚨",
    description: "Severe greenwashing risk — immediate remediation required",
  },
};

export const SEVERITY_COLOR: Record<Severity, string> = {
  critical: "#ef4444",
  high:     "#f97316",
  medium:   "#ffb300",
  low:      "#00ffaa",
};

export const PRIORITY_COLOR: Record<Priority, string> = {
  critical: "#ef4444",
  high:     "#f97316",
  medium:   "#ffb300",
  low:      "#64748b",
};

export const PRIORITY_LABEL: Record<Priority, string> = {
  critical: "Critical",
  high:     "High",
  medium:   "Medium",
  low:      "Low",
};
