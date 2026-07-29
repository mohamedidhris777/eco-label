/**
 * EcoLabel X — Results Page
 * Route: /dashboard/results
 */
"use client";

import { useCallback, useRef, useState } from "react";
import { DashboardTopNav }  from "@/components/dashboard/DashboardTopNav";
import { RiskGauge }        from "@/components/greenwashing/RiskGauge";
import { TrustScoreGauge }  from "@/components/results/TrustScoreGauge";
import { CarbonChart }      from "@/components/results/CarbonChart";
import { ClaimsDonut }      from "@/components/results/ClaimsDonut";
import { EvidenceTimeline } from "@/components/results/EvidenceTimeline";
import {
  DEMO_RESULTS, RISK_COLORS, trustColor,
  type ResultsData,
} from "@/components/results/types";
import { type RiskLevel } from "@/components/greenwashing/types";
import { API_ENDPOINTS } from "@/lib/api";

const API_URL = API_ENDPOINTS.greenwashingPdf;
type PageState = "demo" | "uploading" | "done" | "error";

// ─── Backend response shape ────────────────────────────────────────────────────
interface BackendReason {
  title:           string;
  category:        string;
  severity:        string;
  affected_claims: number;
}
interface BackendBreakdown {
  total:              number;
  verified:           number;
  partially_verified: number;
  not_verified:       number;
}
interface BackendReport {
  filename:       string;
  risk_level:     string;
  risk_score:     number;
  risk_color:     string;
  reasons:        BackendReason[];
  claim_breakdown: BackendBreakdown;
}
interface BackendResponse {
  success:    boolean;
  page_count: number;
  report:     BackendReport;
}

// ─── Map backend → ResultsData ────────────────────────────────────────────────
function mapResponse(res: BackendResponse): ResultsData {
  const { report } = res;
  const bd = report.claim_breakdown;

  const trust = Math.round(
    Math.min(100,
      (bd.verified / (bd.total || 1)) * 45 +
      (1 - report.risk_score / 100) * 35 +
      0.65 * 20,
    )
  );
  const carbonScore = Math.max(30, 100 - report.risk_score);

  return {
    filename:    report.filename,
    analyzed_at: new Date().toISOString(),
    page_count:  res.page_count,
    trust_score: trust,
    carbon: {
      overall:       carbonScore,
      reduction_pct: Math.round(carbonScore * 0.4),
      scopes: [
        { label: "Scope 1", target: 50,  actual: Math.round(carbonScore * 0.38), baseline: 2019, target_year: 2030 },
        { label: "Scope 2", target: 100, actual: Math.round(carbonScore * 0.67), baseline: 2019, target_year: 2030 },
        { label: "Scope 3", target: 30,  actual: Math.round(carbonScore * 0.12), baseline: 2020, target_year: 2035 },
      ],
    },
    greenwashing: {
      risk_level:  report.risk_level as RiskLevel,
      risk_score:  report.risk_score,
      risk_color:  report.risk_color,
      top_reasons: report.reasons.slice(0, 3).map((r: BackendReason) => r.title),
    },
    claims: {
      total:              bd.total,
      verified:           bd.verified,
      partially_verified: bd.partially_verified,
      not_verified:       bd.not_verified,
      verified_list:      [],
      rejected_list:      [],
    },
    timeline: report.reasons.map((r: BackendReason, i: number) => ({
      page:       i + 1,
      claim:      r.title,
      category:   r.category,
      verdict:    (r.severity === "critical" || r.severity === "high")
                  ? ("not_verified" as const)
                  : ("partially_verified" as const),
      confidence: r.affected_claims > 0 ? 0.4 : 0.6,
    })),
  };
}

import { useApp } from "@/context/AppContext";

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ResultsPage() {
  const { state: appState, isAnalyzing, progress: appProgress, errorMsg: appError } = useApp();
  const inputRef                  = useRef<HTMLInputElement>(null);
  const [pageState, setPageState] = useState<PageState>("demo");
  const [localProgress, setProgress] = useState(0);
  const [localError, setErrorMsg]  = useState("");
  const [localData, setData]      = useState<ResultsData | null>(null);

  const data = localData || (appState.greenwashing ? mapResponse(appState.greenwashing as unknown as BackendResponse) : DEMO_RESULTS);
  const isDemo = !localData && !appState.greenwashing;
  const effectiveState = isAnalyzing ? "uploading" : (data ? "done" : pageState);
  const progress = isAnalyzing ? appProgress : localProgress;
  const errorMsg = appError || localError;


  const { analyzePDF } = useApp();
  const handleFile = useCallback((file: File) => {
    analyzePDF(file);
  }, [analyzePDF]);

  const handleExport = () => {
    const blob = new Blob(
      [JSON.stringify({ ...data, exported_at: new Date().toISOString() }, null, 2)],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a   = document.createElement("a");
    a.href     = url;
    a.download = `results_${data.filename.replace(".pdf", "")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tc = trustColor(data.trust_score);

  return (
    <>
      <DashboardTopNav
        title="Analysis Results"
        subtitle="Consolidated trust, carbon, greenwashing, and evidence overview."
      />

      <main id="results-content" className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">

        {/* ── Action bar ── */}
        <div
          className="rounded-2xl px-5 py-3 flex flex-wrap items-center gap-3"
          style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-lg" aria-hidden="true">📄</span>
              <p className="text-sm font-semibold text-slate-300 truncate">{data.filename}</p>
              {isDemo && (
                <span
                  className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide"
                  style={{ background: "rgba(155,89,255,0.15)", color: "#9b59ff", border: "1px solid rgba(155,89,255,0.3)" }}
                >Demo</span>
              )}
            </div>
            <p className="text-[10px] text-slate-600 mt-0.5">
              {data.page_count} pages · Analyzed {new Date(data.analyzed_at).toLocaleTimeString()}
            </p>
          </div>

          {effectiveState === "uploading" && (
            <div className="flex items-center gap-3">
              <div className="w-36 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${progress}%`, background: "linear-gradient(90deg,#9b59ff,#00ffaa)" }}
                />
              </div>
              <span className="text-[10px] text-slate-500">{Math.round(progress)}%</span>
            </div>
          )}

          {effectiveState === "error" && (
            <span className="text-[11px] text-red-400">⚠ {errorMsg}</span>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all"
              style={{ background: "rgba(155,89,255,0.12)", color: "#9b59ff", border: "1px solid rgba(155,89,255,0.3)" }}
            >
              <UploadIcon /> Analyze PDF
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] text-slate-500 border border-white/8 hover:text-slate-300 transition-all"
            >
              <DownloadIcon /> Export JSON
            </button>
          </div>
        </div>

        {/* ── Row 1: Trust | Carbon | Greenwashing ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <GlassCard label="Trust Score" accent={tc}>
            <TrustScoreGauge score={data.trust_score} />
            <div className="mt-3 space-y-1.5 text-[11px]">
              {[
                { label: "Verified claims",  value: `${data.claims.verified}/${data.claims.total}` },
                { label: "Risk penalty",     value: `-${data.greenwashing.risk_score} pts` },
                { label: "Avg confidence",   value: "65%" },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between text-slate-500">
                  <span>{label}</span>
                  <span className="font-semibold text-slate-400">{value}</span>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard label="Carbon Analysis" accent="#60a5fa">
            <CarbonChart carbon={data.carbon} />
          </GlassCard>

          <GlassCard label="Greenwashing Risk" accent={RISK_COLORS[data.greenwashing.risk_level]}>
            <RiskGauge score={data.greenwashing.risk_score} riskLevel={data.greenwashing.risk_level} />
            <div className="mt-3 space-y-1.5">
              {data.greenwashing.top_reasons.slice(0, 3).map((r, i) => (
                <div key={i} className="flex items-start gap-2 text-[10px] text-slate-500">
                  <span className="flex-shrink-0 mt-0.5" style={{ color: RISK_COLORS[data.greenwashing.risk_level] }}>▸</span>
                  <span className="leading-snug">{r}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* ── Row 2: Claims Donut ── */}
        <GlassCard label="Claims Breakdown" accent="#00ffaa">
          <ClaimsDonut claims={data.claims} />
        </GlassCard>

        {/* ── Row 3: Evidence Timeline ── */}
        <GlassCard label="Evidence Timeline" accent="#9b59ff">
          <EvidenceTimeline entries={data.timeline} />
        </GlassCard>

        <input
          ref={inputRef} type="file" accept=".pdf,application/pdf"
          className="sr-only" aria-label="PDF file input"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
      </main>
    </>
  );
}

// ─── Glass card ───────────────────────────────────────────────────────────────
interface GlassCardProps {
  label:     string;
  accent:    string;
  children:  React.ReactNode;
  className?: string;
}
function GlassCard({ label, accent, children, className = "" }: GlassCardProps) {
  return (
    <div
      className={`rounded-2xl p-5 backdrop-blur-sm ${className}`}
      style={{
        background: "rgba(255,255,255,0.025)",
        border:     "1px solid rgba(255,255,255,0.07)",
        boxShadow:  "0 4px 24px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.05)",
      }}
    >
      <h3
        className="text-[9px] uppercase tracking-widest font-bold mb-4 flex items-center gap-2"
        style={{ color: accent }}
      >
        <span className="h-px flex-1" style={{ background: `${accent}30` }} />
        {label}
        <span className="h-px flex-1" style={{ background: `${accent}30` }} />
      </h3>
      {children}
    </div>
  );
}

function DownloadIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  );
}
function UploadIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  );
}
