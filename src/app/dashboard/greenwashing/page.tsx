/**
 * EcoLabel X — Greenwashing Analyzer Page
 * Route: /dashboard/greenwashing
 *
 * Flow:
 *   1. Upload PDF  → POST /api/greenwashing/pdf
 *   2. RiskGauge + FlagsRow + BreakdownBar
 *   3. Tabbed sections: Reasons | Missing Evidence | Recommendations
 *   4. Export full JSON report
 */
"use client";

import { useCallback, useRef, useState } from "react";
import { DashboardTopNav }   from "@/components/dashboard/DashboardTopNav";
import { RiskGauge }         from "@/components/greenwashing/RiskGauge";
import {
  ReasonCard, MissingEvidenceList, RecommendationCard,
  BreakdownBar, FlagsRow,
} from "@/components/greenwashing/ReportComponents";
import { API_ENDPOINTS } from "@/lib/api";
import { RISK_CONFIG, type AnalyzePDFResponse, type GreenwashingReport } from "@/components/greenwashing/types";
import { useApp } from "@/context/AppContext";

const API_URL = API_ENDPOINTS.greenwashingPdf;

type PageState = "idle" | "uploading" | "done" | "error";
type ActiveTab = "reasons" | "missing" | "recommendations";

export default function GreenwashingPage() {
  const { state: appState, analyzePDF, isAnalyzing, progress: appProgress, errorMsg: appError } = useApp();
  const inputRef                    = useRef<HTMLInputElement>(null);
  const [pageState, setPageState]   = useState<PageState>("idle");
  const [dragging,  setDragging]    = useState(false);
  const [localProgress, setProgress] = useState(0);
  const [localError, setErrorMsg]   = useState("");
  const [localReport, setReport]    = useState<GreenwashingReport | null>(null);
  const [tab,       setTab]         = useState<ActiveTab>("reasons");

  const report = localReport || (appState.greenwashing ? appState.greenwashing.report : null);
  const effectiveState = isAnalyzing ? "uploading" : (report ? "done" : pageState);
  const progress = isAnalyzing ? appProgress : localProgress;
  const errorMsg = appError || localError;

  const handleFile = useCallback((file: File) => {
    analyzePDF(file);
  }, [analyzePDF]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const reset = () => {
    setPageState("idle");
    setReport(null);
    setProgress(0);
    setErrorMsg("");
    if (inputRef.current) inputRef.current.value = "";
  };

  // ─── Export ──────────────────────────────────────────────────────────────

  const handleExport = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify({ ...report, exported_at: new Date().toISOString() }, null, 2)],
                          { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `greenwashing_${report.filename.replace(".pdf", "")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <>
      <DashboardTopNav
        title="Greenwashing Analyzer"
        subtitle="Detect greenwashing risk across sustainability claims using evidence-based scoring."
      />

      <main id="greenwashing-content" className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">

        {/* ── Upload zone ── */}
        {(effectiveState === "idle" || effectiveState === "error") && (
          <UploadZone
            dragging={dragging} errorMsg={errorMsg}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
          />
        )}

        {/* ── Progress ── */}
        {effectiveState === "uploading" && (
          <div className="rounded-2xl p-8 flex flex-col items-center gap-5"
               style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="text-5xl animate-pulse" aria-hidden="true">🌿</div>
            <p className="text-white font-semibold">Analyzing for greenwashing…</p>
            <p className="text-[11px] text-slate-500">Extract → Detect claims → Verify → Score risk</p>
            <div className="w-full max-w-md h-2 rounded-full overflow-hidden"
                 style={{ background: "rgba(255,255,255,0.07)" }}
                 role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-full rounded-full transition-all duration-300"
                   style={{ width: `${progress}%`, background: "linear-gradient(90deg,#00ffaa,#f97316)", boxShadow: "0 0 12px rgba(249,115,22,0.4)" }} />
            </div>
          </div>
        )}

        {/* ── Results ── */}
        {effectiveState === "done" && report && (
          <Results report={report} tab={tab} setTab={setTab} onExport={handleExport} onReset={reset} />
        )}

        <input ref={inputRef} type="file" accept=".pdf,application/pdf"
               className="sr-only" aria-label="PDF file input"
               onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
      </main>
    </>
  );
}

// ─── Results layout ───────────────────────────────────────────────────────────

function Results({
  report, tab, setTab, onExport, onReset,
}: {
  report:    GreenwashingReport;
  tab:       ActiveTab;
  setTab:    (t: ActiveTab) => void;
  onExport:  () => void;
  onReset:   () => void;
}) {
  const cfg   = RISK_CONFIG[report.risk_level];
  const tabs: { id: ActiveTab; label: string; count: number }[] = [
    { id: "reasons",         label: "Reasons",         count: report.reasons.length },
    { id: "missing",         label: "Missing Evidence", count: report.missing_evidence.length },
    { id: "recommendations", label: "Recommendations",  count: report.recommendations.length },
  ];

  return (
    <div className="space-y-5 animate-slide-up">

      {/* ── Hero card ── */}
      <div
        className="rounded-2xl p-6"
        style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, boxShadow: cfg.glow }}
      >
        <div className="flex flex-wrap gap-8 items-center">

          {/* Gauge */}
          <RiskGauge score={report.risk_score} riskLevel={report.risk_level} />

          {/* Summary */}
          <div className="flex-1 min-w-[200px] space-y-3">
            <div>
              <p className="text-[9px] uppercase tracking-widest text-slate-600 mb-1">Source</p>
              <p className="text-xs text-slate-400 truncate max-w-[280px]" title={report.filename}>
                {report.filename}
              </p>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">{report.summary}</p>
            <FlagsRow flags={report.flags} />
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 self-start">
            <button onClick={onExport}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}
              aria-label="Export report as JSON">
              <DownloadIcon /> Export JSON
            </button>
            <button onClick={onReset}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs text-slate-500 border border-[rgba(255,255,255,0.08)] hover:text-white transition-all">
              <UploadIcon /> New PDF
            </button>
          </div>
        </div>
      </div>

      {/* ── Claim breakdown bar ── */}
      <div className="rounded-2xl p-5 space-y-3"
           style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <h3 className="text-[9px] uppercase tracking-widest text-slate-600">Claim Breakdown</h3>
        <BreakdownBar breakdown={report.claim_breakdown} />
      </div>

      {/* ── Tabbed sections ── */}
      <div className="rounded-2xl overflow-hidden"
           style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>

        {/* Tab bar */}
        <div className="flex border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex-1 flex items-center justify-center gap-2 py-3 text-xs font-semibold transition-all"
              style={{
                color:            tab === t.id ? cfg.color : "#64748b",
                borderBottom:     tab === t.id ? `2px solid ${cfg.color}` : "2px solid transparent",
                background:       tab === t.id ? `${cfg.color}08` : "transparent",
              }}
              aria-selected={tab === t.id}
              role="tab"
            >
              {t.label}
              <span
                className="px-1.5 py-0.5 rounded-full text-[9px] font-bold"
                style={{
                  background: tab === t.id ? cfg.color : "rgba(255,255,255,0.07)",
                  color:      tab === t.id ? "#050a18" : "#64748b",
                }}
              >
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="p-5" role="tabpanel">
          {tab === "reasons" && (
            <div className="space-y-3">
              {report.reasons.length === 0
                ? <EmptyState icon="✅" text="No greenwashing signals detected." />
                : report.reasons.map((r, i) => <ReasonCard key={r.code} reason={r} index={i} />)
              }
            </div>
          )}

          {tab === "missing" && (
            report.missing_evidence.length === 0
              ? <EmptyState icon="✅" text="No critical evidence gaps detected." />
              : <MissingEvidenceList items={report.missing_evidence} />
          )}

          {tab === "recommendations" && (
            <div className="space-y-3">
              {report.recommendations.length === 0
                ? <EmptyState icon="✅" text="No specific recommendations at this time." />
                : report.recommendations.map((r: import("@/components/greenwashing/types").Recommendation, i: number) => <RecommendationCard key={i} rec={r} index={i} />)
              }
            </div>
          )}
        </div>
      </div>
    </div>
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
      onClick={onClick} onKeyDown={(e) => e.key === "Enter" && onClick()}
      onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
      className="relative rounded-2xl p-12 flex flex-col items-center gap-4 cursor-pointer transition-all duration-300"
      style={{
        background: dragging ? "rgba(249,115,22,0.05)" : "rgba(255,255,255,0.02)",
        border: `2px dashed ${dragging ? "rgba(249,115,22,0.5)" : errorMsg ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.1)"}`,
      }}
      aria-label="Upload PDF for greenwashing analysis"
    >
      <div className="text-5xl" aria-hidden="true">{errorMsg ? "⚠️" : "🌿"}</div>
      <div className="text-center">
        <p className="text-white font-semibold text-lg">
          {errorMsg ? "Upload failed" : dragging ? "Drop PDF here" : "Analyze for Greenwashing Risk"}
        </p>
        <p className="text-slate-500 text-sm mt-1">
          {errorMsg ? errorMsg : "PDF only · Max 50 MB · Runs full 4-step pipeline automatically"}
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2 mt-1">
        {["🛡️ Low", "⚠️ Medium", "🔥 High", "🚨 Critical"].map((tag) => (
          <span key={tag} className="px-2.5 py-1 rounded-full text-[10px] text-slate-500"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            {tag}
          </span>
        ))}
      </div>
      {errorMsg && (
        <button onClick={(e) => { e.stopPropagation(); onClick(); }}
          className="px-5 py-2 rounded-xl text-xs font-semibold text-white mt-2"
          style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}>
          Try again
        </button>
      )}
    </div>
  );
}

function EmptyState({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="text-center py-10 text-slate-600">
      <p className="text-3xl mb-2" aria-hidden="true">{icon}</p>
      <p className="text-sm">{text}</p>
    </div>
  );
}

function DownloadIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}
function UploadIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}
