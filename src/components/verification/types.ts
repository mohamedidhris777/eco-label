/**
 * EcoLabel X — Verification Module: TypeScript types
 * Mirrors the backend verification schemas exactly.
 */

export type Verdict      = "verified" | "partially_verified" | "not_verified";
export type EvidenceType = "quantitative" | "certification" | "target"
                         | "verified_by_third_party" | "policy" | "contextual";

export interface EvidencePassage {
  text:            string;
  page:            number;
  relevance_score: number;  // 0–1
  evidence_type:   EvidenceType;
}

export interface ClaimVerificationResult {
  claim:                   string;
  page:                    number;
  category:                string;
  keywords_matched:        string[];
  original_confidence:     number;
  verdict:                 Verdict;
  verification_confidence: number;
  evidence:                EvidencePassage[];
  evidence_count:          number;
  verdict_reason:          string;
}

export interface VerificationSummary {
  total_claims:                number;
  verified:                    number;
  partially_verified:          number;
  not_verified:                number;
  avg_verification_confidence: number;
  by_category:                 Record<string, Record<Verdict, number>>;
}

export interface VerifyPDFResponse {
  success:    boolean;
  filename:   string;
  size_bytes: number;
  page_count: number;
  results:    ClaimVerificationResult[];
  summary:    VerificationSummary;
}

// ─── UI display config ────────────────────────────────────────────────────────

export interface VerdictConfig {
  label:       string;
  icon:        string;
  color:       string;
  bg:          string;
  border:      string;
  description: string;
}

export const VERDICT_CONFIG: Record<Verdict, VerdictConfig> = {
  verified: {
    label:       "Verified",
    icon:        "✓",
    color:       "#00ffaa",
    bg:          "rgba(0,255,170,0.08)",
    border:      "rgba(0,255,170,0.25)",
    description: "Strong corroborating evidence found in the document",
  },
  partially_verified: {
    label:       "Partial",
    icon:        "◑",
    color:       "#ffb300",
    bg:          "rgba(255,179,0,0.08)",
    border:      "rgba(255,179,0,0.25)",
    description: "Some evidence found but lacking specificity or quantitative data",
  },
  not_verified: {
    label:       "Not Verified",
    icon:        "✗",
    color:       "#ef4444",
    bg:          "rgba(239,68,68,0.08)",
    border:      "rgba(239,68,68,0.25)",
    description: "No corroborating evidence found in the document text",
  },
};

export const EVIDENCE_TYPE_LABELS: Record<EvidenceType, { label: string; icon: string }> = {
  quantitative:          { label: "Quantitative",     icon: "📊" },
  certification:         { label: "Certification",    icon: "🏅" },
  target:                { label: "Target",           icon: "🎯" },
  verified_by_third_party: { label: "Third-Party",   icon: "🔍" },
  policy:                { label: "Policy",           icon: "📋" },
  contextual:            { label: "Contextual",       icon: "💬" },
};
