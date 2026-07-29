/**
 * EcoLabel X — Audit Module: Barrel Export
 */
export * from "./types";
export * from "./AuditHeader";
export * from "./ExecutiveSummary";
export * from "./ClaimsTable";
export * from "./EvidenceSection";
export * from "./TrustScoreSection";
export * from "./RecommendationsSection";

// Re-export helpers that audit sub-components need
export { VERDICT_COLORS } from "@/components/results/types";
export {
  PRIORITY_COLOR,
  PRIORITY_LABEL,
  type Priority,
} from "@/components/greenwashing/types";
export { trustColor } from "@/components/results/types";
