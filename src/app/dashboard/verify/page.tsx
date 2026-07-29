/**
 * EcoLabel X — Evidence Verification Page
 * Route: /dashboard/verify
 *
 * Flow:
 *  1. Upload PDF  → POST /api/verify/pdf (extract + detect + verify in one call)
 *  2. VerificationStats — donut ring + headline numbers
 *  3. VerificationFilters — verdict chips, category, confidence, search, export
 *  4. Paginated VerificationCard grid
 */
"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { DashboardTopNav }       from "@/components/dashboard/DashboardTopNav";
import { VerificationCard }      from "@/components/verification/VerificationCard";
import { VerificationStats }     from "@/components/verification/VerificationStats";
import {
  VerificationFilters,
  type VerificationFiltersState,
} from "@/components/verification/VerificationFilters";
import {
  type ClaimVerificationResult,
  type VerifyPDFResponse,
  VERDICT_CONFIG,
} from "@/components/verification/types";
import { downloadPdfReport, downloadJsonReport } from "@/lib/pdfExporter";
import { ALL_CATEGORIES } from "@/components/claims/types";

import { API_ENDPOINTS } from "@/lib/api";
import { useApp } from "@/context/AppContext";

const API_URL   = API_ENDPOINTS.verifyPdf;
const PAGE_SIZE = 9;

type PageState = "idle" | "uploading" | "done" | "error";

const VERDICT_ORDER: Record<string, number> = {
  not_verified: 0, partially_verified: 1, verified: 2,
};

export default function VerifyPage() {
  const { state: appState, isAnalyzing, progress: appProgress, errorMsg: appError } = useApp();
  const inputRef                    = useRef<HTMLInputElement>(null);
  const [pageState, setPageState]   = useState<PageState>("idle");
  const [dragging,  setDragging]    = useState(false);
  const [localProgress, setProgress] = useState(0);
  const [localError, setErrorMsg]   = useState("");
  const [localResult, setResult]    = useState<VerifyPDFResponse | null>(null);
  const [page,      setPage]        = useState(1);
  const [filters,   setFilters]     = useState<VerificationFiltersState>({
    verdicts:      new Set(["verified", "partially_verified", "not_verified"] as const),
    categories:    new Set(ALL_CATEGORIES),
    minConfidence: 0,
    search:        "",
    sortBy:        "verdict",
  });

  const result = localResult || appState.verification;
  const effectiveState = isAnalyzing ? "uploading" : (result ? "done" : pageState);
  const progress = isAnalyzing ? appProgress : localProgress;
  const errorMsg = appError || localError;


  // ─── Upload handler ──────────────────────────────────────────────────────

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setErrorMsg("Only PDF files are supported.");
      setPageState("error");
      return;
    }

    setPageState("uploading");
    setProgress(0);
    setErrorMsg("");
    setResult(null);
    setPage(1);

    let fake = 0;
    const ticker = setInterval(() => {
      fake = Math.min(fake + Math.random() * 8, 90);
      setProgress(fake);
    }, 250);

    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(API_URL, { method: "POST", body: fd });
      clearInterval(ticker);

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail ?? "Server error.");
      }

      const data: VerifyPDFResponse = await res.json();
      setProgress(100);
      setResult(data);
      setPageState("done");
    } catch (err: unknown) {
      clearInterval(ticker);
      setErrorMsg(err instanceof Error ? err.message : "Unknown error.");
      setPageState("error");
    }
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  // ─── Filtered + sorted results ───────────────────────────────────────────

  const filtered = useMemo<ClaimVerificationResult[]>(() => {
    if (!result) return [];
    const { verdicts, categories, minConfidence, search, sortBy } = filters;
    const lq = search.toLowerCase();

    return result.results
      .filter((r) =>
        verdicts.has(r.verdict) &&
        categories.has(r.category) &&
        r.verification_confidence * 100 >= minConfidence &&
        (lq === "" ||
          r.claim.toLowerCase().includes(lq) ||
          r.verdict_reason.toLowerCase().includes(lq) ||
          r.evidence.some((e) => e.text.toLowerCase().includes(lq)))
      )
      .sort((a, b) => {
        if (sortBy === "confidence")
          return b.verification_confidence - a.verification_confidence;
        if (sortBy === "verdict")
          return VERDICT_ORDER[a.verdict] - VERDICT_ORDER[b.verdict] ||
                 b.verification_confidence - a.verification_confidence;
        return a.page - b.page;
      });
  }, [result, filters]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const onFiltersChange = (next: VerificationFiltersState) => {
    setFilters(next);
    setPage(1);
  };

  // ─── Export ──────────────────────────────────────────────────────────────

  const handleExport = () => {
    if (!result) return;
    const payload = {
      filename:    result.filename,
      page_count:  result.page_count,
      exported_at: new Date().toISOString(),
      filters: {
        verdicts:       Array.from(filters.verdicts),
        categories:     Array.from(filters.categories),
        min_confidence: filters.minConfidence / 100,
        search:         filters.search,
      },
      results: filtered.map((r) => ({
        claim:                   r.claim,
        page:                    r.page,
        category:                r.category,
        verdict:                 r.verdict,
        verification_confidence: r.verification_confidence,
        original_confidence:     r.original_confidence,
        verdict_reason:          r.verdict_reason,
        evidence_count:          r.evidence_count,
        evidence: r.evidence.map((e) => ({
          text:            e.text,
          page:            e.page,
          relevance_score: e.relevance_score,
          evidence_type:   e.evidence_type,
        })),
      })),
      summary: result.summary,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `verification_${result.filename.replace(".pdf", "")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPdf = () => {
    if (!result) return;
    downloadPdfReport({
      filename: result.filename,
      totalClaims: result.results.length,
      verifiedClaims: result.summary.verified,
      summary: `Verified ${result.results.length} sustainability claims from '${result.filename}' (${result.summary.verified} verified, ${result.summary.partially_verified} partially verified, ${result.summary.not_verified} unverified).`,
      reasons: result.results.slice(0, 10).map(r => ({ title: `[${r.verdict.toUpperCase()}] ${r.claim}`, detail: r.verdict_reason })),
    });
  };

  const reset = () => {
    setPageState("idle");
    setResult(null);
    setProgress(0);
    setErrorMsg("");
    setPage(1);
    if (inputRef.current) inputRef.current.value = "";
  };

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <>
      <DashboardTopNav
        title="Evidence Verifier"
        subtitle="Upload a sustainability PDF to detect claims and verify them against document evidence."
      />

      <main id="verify-content" className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">

        {/* ── Upload zone ── */}
        {(effectiveState === "idle" || effectiveState === "error") && (
          <UploadZone
            dragging={dragging}
            errorMsg={errorMsg}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
          />
        )}

        {/* ── Progress ── */}
        {effectiveState === "uploading" && (
          <div
            className="rounded-2xl p-8 flex flex-col items-center gap-5"
            style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <div className="text-4xl animate-pulse" aria-hidden="true">🔬</div>
            <p className="text-white font-semibold">Running verification pipeline…</p>
            <p className="text-[11px] text-slate-500">Extract text → Detect claims → Cross-reference evidence</p>
            <div
              className="w-full max-w-md h-2 rounded-full overflow-hidden"
              style={{ background: "rgba(255,255,255,0.07)" }}
              role="progressbar"
              aria-valuenow={Math.round(progress)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width:     `${progress}%`,
                  background: "linear-gradient(90deg,#00ffaa,#9b59ff)",
                  boxShadow:  "0 0 12px rgba(0,255,170,0.4)",
                }}
              />
            </div>
          </div>
        )}

        {/* ── Results ── */}
        {effectiveState === "done" && result && (
          <>
            <VerificationStats
              summary={result.summary}
              filename={result.filename}
              pageCount={result.page_count}
            />

            <VerificationFilters
              filters={filters}
              onChange={onFiltersChange}
              totalFiltered={filtered.length}
              totalAll={result.results.length}
              onExport={handleExport}
              onExportPdf={handleExportPdf}
            />

            {/* Verdict legend + new upload */}
            <div className="flex flex-wrap items-center gap-4 justify-between">
              <div className="flex gap-3 flex-wrap">
                {(["verified", "partially_verified", "not_verified"] as const).map((v) => {
                  const cfg   = VERDICT_CONFIG[v];
                  const count = filtered.filter((r) => r.verdict === v).length;
                  return count > 0 ? (
                    <div key={v} className="flex items-center gap-1.5 text-[11px]">
                      <span className="font-mono font-bold" style={{ color: cfg.color }}>{cfg.icon}</span>
                      <span className="text-slate-400">{cfg.label}</span>
                      <span className="font-bold tabular-nums" style={{ color: cfg.color }}>{count}</span>
                    </div>
                  ) : null;
                })}
              </div>
              <button
                onClick={reset}
                className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs text-slate-400 border border-[rgba(255,255,255,0.1)] hover:text-white hover:border-[rgba(255,255,255,0.2)] transition-all"
              >
                <UploadIcon /> New PDF
              </button>
            </div>

            {/* Grid */}
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-slate-600">
                <p className="text-3xl mb-3">🔎</p>
                <p className="text-sm">No results match your filters.</p>
              </div>
            ) : (
              <section
                aria-label={`${filtered.length} verification results`}
                className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4"
              >
                {paginated.map((r, i) => (
                  <VerificationCard
                    key={`${r.page}-${i}`}
                    result={r}
                    index={(page - 1) * PAGE_SIZE + i}
                    style={{ animationDelay: `${i * 40}ms` }}
                  />
                ))}
              </section>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination current={page} total={totalPages} onChange={setPage} />
            )}
          </>
        )}

        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="sr-only"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          aria-label="PDF file input"
        />
      </main>
    </>
  );
}

// ─── Upload zone ──────────────────────────────────────────────────────────────

function UploadZone({ dragging, errorMsg, onDragOver, onDragLeave, onDrop, onClick }: {
  dragging: boolean; errorMsg: string;
  onDragOver: React.DragEventHandler; onDragLeave: React.DragEventHandler;
  onDrop: React.DragEventHandler; onClick: () => void;
}) {
  return (
    <div
      role="button" tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
      className="relative rounded-2xl p-12 flex flex-col items-center gap-4 cursor-pointer transition-all duration-300"
      style={{
        background: dragging ? "rgba(155,89,255,0.05)" : "rgba(255,255,255,0.02)",
        border: `2px dashed ${dragging ? "rgba(155,89,255,0.5)" : errorMsg ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.1)"}`,
      }}
      aria-label="Upload a PDF for evidence verification"
    >
      <div className="text-5xl" aria-hidden="true">{errorMsg ? "⚠️" : "🔬"}</div>
      <div className="text-center">
        <p className="text-white font-semibold text-lg">
          {errorMsg ? "Upload failed" : dragging ? "Drop your PDF here" : "Upload PDF to verify claims"}
        </p>
        <p className="text-slate-500 text-sm mt-1">
          {errorMsg ? errorMsg : "Single file · PDF only · Max 50 MB · Runs claim detection + verification automatically"}
        </p>
      </div>

      {!errorMsg && (
        <div className="flex flex-wrap justify-center gap-2 mt-2 max-w-lg">
          {["✓ Verified", "◑ Partially Verified", "✗ Not Verified"].map((tag) => (
            <span key={tag} className="px-2.5 py-1 rounded-full text-[10px] text-slate-500"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              {tag}
            </span>
          ))}
        </div>
      )}

      {errorMsg && (
        <button
          onClick={(e) => { e.stopPropagation(); onClick(); }}
          className="px-5 py-2 rounded-xl text-xs font-semibold text-white"
          style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}
        >
          Try again
        </button>
      )}
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({ current, total, onChange }: { current: number; total: number; onChange: (p: number) => void }) {
  return (
    <nav className="flex items-center justify-center gap-2 pb-2" aria-label="Verification results pagination">
      <button onClick={() => onChange(current - 1)} disabled={current === 1}
        className="px-3 py-1.5 rounded-lg text-xs text-slate-400 border border-[rgba(255,255,255,0.1)] disabled:opacity-30 hover:text-white transition-all"
        aria-label="Previous page">← Prev</button>
      {Array.from({ length: total }, (_, i) => i + 1).map((p) => (
        <button key={p} onClick={() => onChange(p)}
          className="w-8 h-8 rounded-lg text-xs font-semibold transition-all"
          style={{ background: p === current ? "#00ffaa" : "rgba(255,255,255,0.04)", color: p === current ? "#050a18" : "#64748b", border: `1px solid ${p === current ? "#00ffaa" : "rgba(255,255,255,0.08)"}` }}
          aria-current={p === current ? "page" : undefined} aria-label={`Page ${p}`}>{p}</button>
      ))}
      <button onClick={() => onChange(current + 1)} disabled={current === total}
        className="px-3 py-1.5 rounded-lg text-xs text-slate-400 border border-[rgba(255,255,255,0.1)] disabled:opacity-30 hover:text-white transition-all"
        aria-label="Next page">Next →</button>
    </nav>
  );
}

function UploadIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}
