/**
 * EcoLabel X — Centralized API Client
 *
 * Single source of truth for:
 *   - Base URL (reads NEXT_PUBLIC_API_URL env var, falls back to localhost)
 *   - All endpoint paths
 *   - Typed fetch wrappers for every backend route
 *   - Consistent error handling
 */

// ─── Base URL ─────────────────────────────────────────────────────────────────

export const API_BASE =
  (typeof process !== "undefined" &&
    process.env.NEXT_PUBLIC_API_BASE) ||
  (typeof process !== "undefined" &&
    process.env.NEXT_PUBLIC_API_URL) ||
  "";

// ─── Endpoint map ─────────────────────────────────────────────────────────────

export const API_ENDPOINTS = {
  health:               `${API_BASE}/health`,
  pdfExtract:           `${API_BASE}/api/pdf/extract`,
  pdfExtractAll:        `${API_BASE}/api/pdf/extract/all`,
  claimsDetect:         `${API_BASE}/api/claims/detect`,
  verifyPdf:            `${API_BASE}/api/verify/pdf`,
  verifyClaims:         `${API_BASE}/api/verify/claims`,
  greenwashingPdf:      `${API_BASE}/api/greenwashing/pdf`,
  greenwashingAnalyze:  `${API_BASE}/api/greenwashing/analyze`,
} as const;

// ─── Error ────────────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    message:          string,
    public status:    number,
    public endpoint:  string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function extractError(res: Response, endpoint: string): Promise<never> {
  let message = `HTTP ${res.status}: ${res.statusText}`;
  try {
    const body = await res.json();
    message = body?.detail ?? body?.message ?? message;
  } catch { /* ignore */ }
  throw new ApiError(message, res.status, endpoint);
}

// ─── Generic typed fetch ──────────────────────────────────────────────────────

export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(endpoint, options);
  if (!res.ok) await extractError(res, endpoint);
  return res.json() as Promise<T>;
}

export async function apiUpload<T>(
  endpoint: string,
  file: File,
  fieldName = "file",
): Promise<T> {
  const fd = new FormData();
  fd.append(fieldName, file);
  return apiFetch<T>(endpoint, { method: "POST", body: fd });
}

// ─── Typed endpoint wrappers ──────────────────────────────────────────────────

import type { ClaimDetectionResponse }   from "@/components/claims/types";
import type { VerifyPDFResponse }        from "@/components/verification/types";

/** POST /api/claims/detect — upload PDF, return detected claims */
export async function detectClaims(file: File): Promise<ClaimDetectionResponse> {
  return apiUpload<ClaimDetectionResponse>(API_ENDPOINTS.claimsDetect, file);
}

/** POST /api/verify/pdf — upload PDF, return verified claims */
export async function verifyPdf(file: File): Promise<VerifyPDFResponse> {
  return apiUpload<VerifyPDFResponse>(API_ENDPOINTS.verifyPdf, file);
}

/** POST /api/greenwashing/pdf — upload PDF, return full greenwashing report */
export async function analyzeGreenwashingPdf(file: File): Promise<GreenwashingPdfResponse> {
  return apiUpload<GreenwashingPdfResponse>(API_ENDPOINTS.greenwashingPdf, file);
}

/** GET /health — ping backend */
export async function pingHealth(): Promise<{ status: string }> {
  return apiFetch<{ status: string }>(API_ENDPOINTS.health);
}

// ─── Greenwashing response shape (mirrors backend schema) ─────────────────────

export interface GreenwashingReason {
  code:            string;
  title:           string;
  description:     string;
  severity:        "critical" | "high" | "medium" | "low";
  affected_claims: number;
  category:        string;
}

export interface GreenwashingClaimBreakdown {
  total:                     number;
  verified:                  number;
  partially_verified:        number;
  not_verified:              number;
  vague_claims:              number;
  quantitative_claims:       number;
  absolute_claims_unverified: number;
}

export interface GreenwashingReport {
  filename:        string;
  risk_level:      "Low" | "Medium" | "High" | "Critical";
  risk_score:      number;
  risk_color:      string;
  summary:         string;
  reasons:         GreenwashingReason[];
  missing_evidence: { category: string; item: string; priority: string }[];
  recommendations: { priority: string; action: string; rationale: string; category: string }[];
  claim_breakdown: GreenwashingClaimBreakdown;
  flags: {
    has_certifications: boolean;
    has_third_party:    boolean;
    has_timelines:      boolean;
  };
}

export interface GreenwashingPdfResponse {
  success:    boolean;
  page_count: number;
  report:     GreenwashingReport;
}
