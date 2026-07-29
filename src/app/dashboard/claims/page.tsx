/**
 * EcoLabel X — Sustainability Claims Detection Page
 * Route: /dashboard/claims
 *
 * Flow:
 *  1. Upload zone  → POST /api/claims/detect
 *  2. ClaimStats   → summary stats + category breakdown
 *  3. ClaimFilters → search, category chips, confidence slider, export
 *  4. ClaimCard grid → paginated, filtered, sorted results
 */
"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { DashboardTopNav }  from "@/components/dashboard/DashboardTopNav";
import { ClaimCard }        from "@/components/claims/ClaimCard";
import { ClaimStats }       from "@/components/claims/ClaimStats";
import { ClaimFilters, type ClaimFiltersState } from "@/components/claims/ClaimFilters";
import { API_ENDPOINTS } from "@/lib/api";
import { ALL_CATEGORIES, type ClaimDetectionResponse, type ClaimResult } from "@/components/claims/types";
import { useApp } from "@/context/AppContext";

const API_URL   = API_ENDPOINTS.claimsDetect;
const PAGE_SIZE  = 12;

type PageState = "idle" | "uploading" | "done" | "error";

export default function ClaimsPage() {
  const { state: appState, analyzePDF, isAnalyzing, progress: appProgress, errorMsg: appError } = useApp();
  const inputRef                      = useRef<HTMLInputElement>(null);
  const [pageState, setPageState]     = useState<PageState>("idle");
  const [dragging,  setDragging]      = useState(false);
  const [localProgress, setProgress]  = useState(0);
  const [localError, setErrorMsg]     = useState("");
  const [localResult, setResult]      = useState<ClaimDetectionResponse | null>(null);
  const [page,      setPage]          = useState(1);
  const [filters, setFilters]         = useState<ClaimFiltersState>({
    search:        "",
    categories:    new Set(ALL_CATEGORIES),
    minConfidence: 0,
    sortBy:        "page",
  });

  const result = localResult || appState.claims;
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

    // Animate progress bar (no real XHR progress from fetch)
    let fake = 0;
    const ticker = setInterval(() => {
      fake = Math.min(fake + Math.random() * 12, 88);
      setProgress(fake);
    }, 200);

    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch(API_URL, { method: "POST", body: fd });
      clearInterval(ticker);

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail ?? "Unexpected error from server.");
      }

      const data: ClaimDetectionResponse = await res.json();
      setProgress(100);
      setResult(data);
      setPageState("done");
    } catch (err: unknown) {
      clearInterval(ticker);
      setErrorMsg(err instanceof Error ? err.message : "Unknown error.");
      setPageState("error");
    }
  }, []);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  // ─── Filtered + sorted claims ────────────────────────────────────────────

  const filtered = useMemo<ClaimResult[]>(() => {
    if (!result) return [];
    const { search, categories, minConfidence, sortBy } = filters;
    const lq = search.toLowerCase();

    return result.claims
      .filter((c) =>
        categories.has(c.category) &&
        c.confidence * 100 >= minConfidence &&
        (lq === "" || c.claim.toLowerCase().includes(lq) || c.keywords_matched.some((k) => k.includes(lq)))
      )
      .sort((a, b) =>
        sortBy === "confidence"
          ? b.confidence - a.confidence
          : a.page - b.page || b.confidence - a.confidence
      );
  }, [result, filters]);

  const totalPages  = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const onFiltersChange = (next: ClaimFiltersState) => {
    setFilters(next);
    setPage(1);
  };

  // ─── Export ──────────────────────────────────────────────────────────────

  const handleExport = () => {
    if (!result) return;
    const payload = {
      filename:   result.filename,
      page_count: result.page_count,
      exported_at: new Date().toISOString(),
      filters: {
        categories:    Array.from(filters.categories),
        min_confidence: filters.minConfidence / 100,
        search:        filters.search,
      },
      claims: filtered.map((c) => ({
        claim:            c.claim,
        page:             c.page,
        confidence:       c.confidence,
        category:         c.category,
        keywords_matched: c.keywords_matched,
      })),
      summary: result.summary,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `claims_${result.filename.replace(".pdf", "")}.json`;
    a.click();
    URL.revokeObjectURL(url);
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
        title="Claim Detector"
        subtitle="Upload a sustainability PDF to extract and classify environmental claims."
      />

      <main id="claims-content" className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">

        {/* ── Upload zone (idle / error state) ── */}
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

        {/* ── Uploading state ── */}
        {effectiveState === "uploading" && (
          <div
            className="rounded-2xl p-8 flex flex-col items-center gap-5"
            style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <div className="text-4xl animate-pulse" aria-hidden="true">🔍</div>
            <p className="text-white font-semibold">Analysing PDF…</p>
            <div
              className="w-full max-w-md h-2 rounded-full overflow-hidden"
              style={{ background: "rgba(255,255,255,0.07)" }}
              role="progressbar"
              aria-valuenow={Math.round(progress)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Upload and analysis progress"
            >
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width:      `${progress}%`,
                  background: "linear-gradient(90deg,#00ffaa,#00c8ff)",
                  boxShadow:  "0 0 10px rgba(0,255,170,0.4)",
                }}
              />
            </div>
            <p className="text-xs text-slate-500">Extracting text → scanning sentences → classifying claims</p>
          </div>
        )}

        {/* ── Results ── */}
        {effectiveState === "done" && result && (
          <>
            {/* Stats */}
            <ClaimStats
              summary={result.summary}
              filename={result.filename}
              pageCount={result.page_count}
            />

            {/* Filters */}
            <ClaimFilters
              filters={filters}
              onChange={onFiltersChange}
              totalFiltered={filtered.length}
              totalAll={result.claims.length}
              onExport={handleExport}
            />

            {/* New upload button */}
            <div className="flex justify-end">
              <button
                onClick={reset}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs text-slate-400 border border-[rgba(255,255,255,0.1)] hover:text-white hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.04)] transition-all"
                aria-label="Upload a new PDF"
              >
                <UploadIcon /> Upload new PDF
              </button>
            </div>

            {/* Claims grid */}
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-slate-600">
                <p className="text-3xl mb-3">🔎</p>
                <p className="text-sm">No claims match your current filters.</p>
              </div>
            ) : (
              <section
                aria-label={`${filtered.length} detected claims`}
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
              >
                {paginated.map((claim, i) => (
                  <ClaimCard
                    key={`${claim.page}-${i}`}
                    claim={claim}
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

        {/* Hidden file input */}
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="sr-only"
          onChange={onInputChange}
          aria-label="PDF file input"
        />
      </main>
    </>
  );
}

// ─── Upload zone ──────────────────────────────────────────────────────────────

function UploadZone({
  dragging,
  errorMsg,
  onDragOver,
  onDragLeave,
  onDrop,
  onClick,
}: {
  dragging:    boolean;
  errorMsg:    string;
  onDragOver:  React.DragEventHandler;
  onDragLeave: React.DragEventHandler;
  onDrop:      React.DragEventHandler;
  onClick:     () => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className="relative rounded-2xl p-12 flex flex-col items-center gap-4 cursor-pointer transition-all duration-300"
      style={{
        background:  dragging ? "rgba(0,255,170,0.05)" : "rgba(255,255,255,0.02)",
        border:      `2px dashed ${dragging ? "rgba(0,255,170,0.5)" : errorMsg ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.1)"}`,
      }}
      aria-label="Upload a PDF for claim detection. Click or drag and drop."
    >
      <div className="text-5xl" aria-hidden="true">{errorMsg ? "⚠️" : "📄"}</div>
      <div className="text-center">
        <p className="text-white font-semibold text-lg">
          {errorMsg ? "Upload failed" : dragging ? "Drop your PDF here" : "Upload a PDF to detect claims"}
        </p>
        <p className="text-slate-500 text-sm mt-1">
          {errorMsg
            ? errorMsg
            : "Drag and drop or click to browse · PDF only · Max 50 MB"}
        </p>
      </div>

      {/* Supported categories preview */}
      {!errorMsg && (
        <div className="flex flex-wrap justify-center gap-2 mt-2 max-w-lg">
          {["🌿 Carbon", "⚡ Energy", "♻️ Recycling", "💧 Water", "🌱 Biodiversity", "🏅 Certifications", "🎯 Targets"].map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 rounded-full text-[10px] text-slate-500"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
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

function Pagination({ current, total, onChange }: {
  current: number;
  total:   number;
  onChange: (p: number) => void;
}) {
  const pages = Array.from({ length: total }, (_, i) => i + 1);

  return (
    <nav
      className="flex items-center justify-center gap-2 pb-2"
      aria-label="Claim results pagination"
    >
      <button
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
        className="px-3 py-1.5 rounded-lg text-xs text-slate-400 border border-[rgba(255,255,255,0.1)] disabled:opacity-30 hover:text-white hover:border-[rgba(255,255,255,0.2)] transition-all"
        aria-label="Previous page"
      >
        ← Prev
      </button>

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className="w-8 h-8 rounded-lg text-xs font-semibold transition-all"
          style={{
            background:  p === current ? "#00ffaa" : "rgba(255,255,255,0.04)",
            color:       p === current ? "#050a18"  : "#64748b",
            border:      `1px solid ${p === current ? "#00ffaa" : "rgba(255,255,255,0.08)"}`,
          }}
          aria-label={`Page ${p}`}
          aria-current={p === current ? "page" : undefined}
        >
          {p}
        </button>
      ))}

      <button
        onClick={() => onChange(current + 1)}
        disabled={current === total}
        className="px-3 py-1.5 rounded-lg text-xs text-slate-400 border border-[rgba(255,255,255,0.1)] disabled:opacity-30 hover:text-white hover:border-[rgba(255,255,255,0.2)] transition-all"
        aria-label="Next page"
      >
        Next →
      </button>
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
