/**
 * EcoLabel X — Pipeline Store
 *
 * Lightweight cross-module state store backed by localStorage.
 * Allows the Claims → Verify → Greenwashing → Results → Audit
 * pipeline to share analysis results without re-uploading.
 *
 * Usage:
 *   const { state, setClaimsResult, setVerifyResult, setGreenwashingResult } = usePipelineStore();
 */
"use client";

import { useLocalStorage } from "@/lib/hooks/useLocalStorage";
import type { ClaimDetectionResponse }   from "@/components/claims/types";
import type { VerifyPDFResponse }        from "@/components/verification/types";
import type { AnalyzePDFResponse }       from "@/components/greenwashing/types";


export interface PipelineState {
  filename?:        string;
  analyzedAt?:      string;
  pageCount?:       number;
  /** Stage 1 result */
  claims?:          ClaimDetectionResponse | null;
  /** Stage 2 result */
  verification?:    VerifyPDFResponse      | null;
  /** Stage 3 result (full pipeline) */
  greenwashing?:    AnalyzePDFResponse     | null;
}

const STORE_KEY = "ecolabelx_pipeline_v1";
const INITIAL: PipelineState = {};

export function usePipelineStore() {
  const [state, setState, clearState] = useLocalStorage<PipelineState>(STORE_KEY, INITIAL);

  const setClaimsResult = (res: ClaimDetectionResponse) =>
    setState((prev) => ({
      ...prev,
      filename:    res.filename,
      analyzedAt:  new Date().toISOString(),
      pageCount:   res.page_count,
      claims:      res,
    }));

  const setVerifyResult = (res: VerifyPDFResponse) =>
    setState((prev) => ({
      ...prev,
      filename:     res.filename,
      analyzedAt:   new Date().toISOString(),
      pageCount:    res.page_count,
      verification: res,
    }));

  const setGreenwashingResult = (res: AnalyzePDFResponse) =>
    setState((prev) => ({
      ...prev,
      filename:      res.report.filename,
      analyzedAt:    new Date().toISOString(),
      greenwashing:  res,
    }));

  /** Whether any stage has been completed */
  const hasAnyResult = !!(state.claims || state.verification || state.greenwashing);

  return {
    state,
    hasAnyResult,
    setClaimsResult,
    setVerifyResult,
    setGreenwashingResult,
    clearState,
  };
}
