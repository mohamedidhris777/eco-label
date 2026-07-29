/**
 * EcoLabel X — Audit Report Module: Types + convenience re-exports
 */

import { type ResultsData } from "@/components/results/types";

export interface AuditReport extends ResultsData {
  report_id:      string;
  classification: string;
  period:         string;
  prepared_by:    string;
  version:        string;
}

/** Build a report header from the base ResultsData */
export function buildAuditReport(base: ResultsData, seq = 5983): AuditReport {
  const yr = 2026;
  return {
    ...base,
    report_id:      `ECO-${yr}-${seq}`,
    classification: "CONFIDENTIAL",
    period:         `FY ${yr - 1} — ${yr}`,
    prepared_by:    "EcoLabel X AI Audit Engine v1.0",
    version:        "1.0",
  };
}

// ─── Convenience re-exports so sub-components only import from "./types" ───────
export {
  VERDICT_COLORS,
  trustColor,
  type ClaimVerdict,
  type RiskLevel,
} from "@/components/results/types";

export {
  PRIORITY_COLOR,
  PRIORITY_LABEL,
  type Priority,
} from "@/components/greenwashing/types";
