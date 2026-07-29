/**
 * EcoLabel X — Results Module: TypeScript types
 */

export type ClaimVerdict = "verified" | "partially_verified" | "not_verified";
export type RiskLevel    = "Low" | "Medium" | "High" | "Critical";

export interface CarbonScope {
  label:       string;   // "Scope 1", "Scope 2", "Scope 3"
  target:      number;   // reduction target %
  actual:      number;   // achieved reduction %
  baseline:    number;   // baseline year
  target_year: number;
}

export interface CarbonScore {
  overall:       number;   // 0–100 composite score
  reduction_pct: number;   // overall reduction achieved
  scopes:        CarbonScope[];
}

export interface GreenwashingSnapshot {
  risk_level:  RiskLevel;
  risk_score:  number;
  risk_color:  string;
  top_reasons: string[];
}

export interface ClaimEntry {
  id:         string;
  text:       string;
  page:       number;
  category:   string;
  confidence: number;
  verdict:    ClaimVerdict;
  evidence?:  string;
}

export interface TimelineEntry {
  page:       number;
  claim:      string;
  category:   string;
  verdict:    ClaimVerdict;
  confidence: number;
  evidence?:  string;
}

export interface ClaimsData {
  total:             number;
  verified:          number;
  partially_verified: number;
  not_verified:      number;
  verified_list:     ClaimEntry[];
  rejected_list:     ClaimEntry[];
}

export interface ResultsData {
  filename:       string;
  analyzed_at:    string;
  page_count:     number;
  trust_score:    number;         // 0–100
  carbon:         CarbonScore;
  greenwashing:   GreenwashingSnapshot;
  claims:         ClaimsData;
  timeline:       TimelineEntry[];
}

// ─── Demo data ────────────────────────────────────────────────────────────────

export const DEMO_RESULTS: ResultsData = {
  filename:    "GreenCorp_Sustainability_Report_2024.pdf",
  analyzed_at: new Date().toISOString(),
  page_count:  48,
  trust_score: 61,

  carbon: {
    overall:       72,
    reduction_pct: 34,
    scopes: [
      { label: "Scope 1", target: 50, actual: 38, baseline: 2019, target_year: 2030 },
      { label: "Scope 2", target: 100, actual: 67, baseline: 2019, target_year: 2030 },
      { label: "Scope 3", target: 30, actual: 12, baseline: 2020, target_year: 2035 },
    ],
  },

  greenwashing: {
    risk_level:  "Medium",
    risk_score:  48,
    risk_color:  "#ffb300",
    top_reasons: [
      "19% of claims lack quantitative data",
      "No third-party assurance statement detected",
      "3 absolute claims could not be corroborated",
    ],
  },

  claims: {
    total:             31,
    verified:          13,
    partially_verified: 10,
    not_verified:       8,
    verified_list: [
      { id: "v1",  text: "Reduced Scope 1 emissions by 38% against 2019 baseline.", page: 5,  category: "carbon",          confidence: 0.91, verdict: "verified",           evidence: "GHG inventory confirmed 38.2% absolute reduction in direct combustion." },
      { id: "v2",  text: "67% of electricity sourced from renewable PPAs as of 2023.", page: 9,  category: "renewable_energy", confidence: 0.88, verdict: "verified",           evidence: "Contractual PPA agreements cover 67.4% of total electricity consumption." },
      { id: "v3",  text: "ISO 14001:2015 certification maintained across all manufacturing sites.", page: 12, category: "certification",    confidence: 0.95, verdict: "verified",           evidence: "Certificate No. EMS-2024-0412 issued by Bureau Veritas, valid until 2026." },
      { id: "v4",  text: "93% of cardboard packaging made from post-consumer recycled content.", page: 19, category: "packaging",         confidence: 0.87, verdict: "verified",           evidence: "Material testing reports confirm 93.1% PCR content by mass." },
      { id: "v5",  text: "Water intensity reduced by 22% per unit of production since 2020.", page: 23, category: "water",            confidence: 0.82, verdict: "verified",           evidence: "Water withdrawal data: 2020 baseline 4.8 ML/tonne; 2023 actual 3.74 ML/tonne." },
    ],
    rejected_list: [
      { id: "r1",  text: "We are committed to being a fully sustainable company.", page: 3,  category: "general",          confidence: 0.12, verdict: "not_verified" },
      { id: "r2",  text: "Our products are 100% eco-friendly.", page: 7,  category: "general",          confidence: 0.08, verdict: "not_verified" },
      { id: "r3",  text: "We will achieve net-zero emissions across our entire value chain.", page: 14, category: "targets",          confidence: 0.22, verdict: "not_verified" },
      { id: "r4",  text: "Our supply chain is fully deforestation-free.", page: 28, category: "biodiversity",       confidence: 0.18, verdict: "not_verified" },
      { id: "r5",  text: "All packaging is naturally biodegradable.", page: 33, category: "packaging",         confidence: 0.11, verdict: "not_verified" },
    ],
  },

  timeline: [
    { page: 3,  claim: "We are committed to being a fully sustainable company.",               category: "general",          verdict: "not_verified",       confidence: 0.12 },
    { page: 5,  claim: "Scope 1 emissions reduced 38% vs 2019 baseline.",                       category: "carbon",          verdict: "verified",           confidence: 0.91, evidence: "GHG inventory confirms 38.2% absolute reduction." },
    { page: 7,  claim: "Our products are 100% eco-friendly.",                                   category: "general",          verdict: "not_verified",       confidence: 0.08 },
    { page: 9,  claim: "67% of electricity from renewable PPAs in 2023.",                       category: "renewable_energy", verdict: "verified",           confidence: 0.88, evidence: "PPA contracts cover 67.4% of electricity consumption." },
    { page: 12, claim: "ISO 14001:2015 certification across all manufacturing sites.",          category: "certification",    verdict: "verified",           confidence: 0.95, evidence: "Certificate No. EMS-2024-0412, valid until 2026." },
    { page: 14, claim: "Net-zero emissions across the entire value chain by 2050.",             category: "targets",          verdict: "partially_verified", confidence: 0.44, evidence: "Commitment letter references SBTi alignment but validation pending." },
    { page: 17, claim: "Recycled content in product materials increased to 41%.",               category: "recycling",        verdict: "partially_verified", confidence: 0.55, evidence: "Material reports show 41.2% but third-party verification absent." },
    { page: 19, claim: "93% of cardboard packaging from post-consumer recycled content.",       category: "packaging",        verdict: "verified",           confidence: 0.87, evidence: "Material testing reports confirm 93.1% PCR content by mass." },
    { page: 23, claim: "Water intensity reduced by 22% per unit of production since 2020.",    category: "water",            verdict: "verified",           confidence: 0.82, evidence: "2020 baseline 4.8 ML/tonne; 2023 actual 3.74 ML/tonne." },
    { page: 28, claim: "Our supply chain is fully deforestation-free.",                         category: "biodiversity",     verdict: "not_verified",       confidence: 0.18 },
    { page: 31, claim: "Tier-1 suppliers audited against our code of conduct.",                 category: "supply_chain",     verdict: "partially_verified", confidence: 0.61, evidence: "Supplier audit summary references 78% coverage, methodology unclear." },
    { page: 33, claim: "All packaging is naturally biodegradable.",                             category: "packaging",        verdict: "not_verified",       confidence: 0.11 },
    { page: 38, claim: "Reduced Scope 2 emissions by 67% through renewable electricity.",      category: "carbon",          verdict: "verified",           confidence: 0.88, evidence: "RE100 progress report confirms 67% RE share." },
    { page: 42, claim: "Targeting 30% Scope 3 reduction by 2035 from 2020 baseline.",          category: "targets",          verdict: "partially_verified", confidence: 0.48, evidence: "Target stated but baseline data incomplete." },
    { page: 45, claim: "Rainforest Alliance certification for coffee and cocoa sourcing.",     category: "certification",    verdict: "verified",           confidence: 0.93, evidence: "RA cert #RA-2024-0871 covers 100% of coffee and 85% of cocoa." },
  ],
};

// ─── Colour helpers ───────────────────────────────────────────────────────────

export const VERDICT_COLORS: Record<ClaimVerdict, { color: string; bg: string; border: string; icon: string }> = {
  verified:           { color: "#00ffaa", bg: "rgba(0,255,170,0.08)", border: "rgba(0,255,170,0.25)", icon: "✓" },
  partially_verified: { color: "#ffb300", bg: "rgba(255,179,0,0.08)", border: "rgba(255,179,0,0.25)", icon: "◑" },
  not_verified:       { color: "#ef4444", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.25)", icon: "✗" },
};

export const RISK_COLORS: Record<RiskLevel, string> = {
  Low: "#00ffaa", Medium: "#ffb300", High: "#f97316", Critical: "#ef4444",
};

export function trustColor(score: number): string {
  if (score >= 70) return "#00ffaa";
  if (score >= 45) return "#ffb300";
  return "#ef4444";
}

export function carbonColor(pct: number): string {
  if (pct >= 80) return "#00ffaa";
  if (pct >= 50) return "#60a5fa";
  return "#ffb300";
}
