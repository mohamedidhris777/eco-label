/**
 * EcoLabel X — Audit Report Page
 * Route: /dashboard/audit
 *
 * Professional A4-style document layout with 5 sections:
 *   1. Executive Summary
 *   2. Claims Analysis
 *   3. Evidence Review
 *   4. Trust Score Assessment
 *   5. Recommendations
 *
 * PDF export: window.print() with @media print CSS.
 * Data: DEMO_RESULTS by default; runs full pipeline on PDF upload.
 */
"use client";

import { useCallback, useRef, useState } from "react";
import { DashboardTopNav }       from "@/components/dashboard/DashboardTopNav";
import { AuditHeader }           from "@/components/audit/AuditHeader";
import { ExecutiveSummary }      from "@/components/audit/ExecutiveSummary";
import { ClaimsTable }           from "@/components/audit/ClaimsTable";
import { EvidenceSection }       from "@/components/audit/EvidenceSection";
import { TrustScoreSection }     from "@/components/audit/TrustScoreSection";
import { RecommendationsSection } from "@/components/audit/RecommendationsSection";
import { buildAuditReport, type AuditReport } from "@/components/audit/types";
import { DEMO_RESULTS, type ResultsData }     from "@/components/results/types";

// ─── Print CSS ────────────────────────────────────────────────────────────────
const PRINT_STYLES = `
@media print {
  @page {
    size: A4 portrait;
    margin: 18mm 20mm;
  }
  body {
    background: white !important;
    color: black !important;
  }
  /* Hide dashboard chrome */
  aside,
  header,
  #audit-controls,
  [data-no-print] {
    display: none !important;
  }
  /* Reset layout */
  body > *,
  body > * > * {
    display: block !important;
    overflow: visible !important;
    height: auto !important;
  }
  main {
    padding: 0 !important;
    margin: 0 !important;
    background: white !important;
  }
  /* Document */
  #audit-document {
    box-shadow: none !important;
    border-radius: 0 !important;
    border: none !important;
    background: white !important;
    padding: 0 !important;
    max-width: none !important;
  }
  /* Section breaks */
  .audit-page-break { page-break-before: always; }
  .no-break         { page-break-inside: avoid; }
  .audit-section    { page-break-inside: avoid; margin-bottom: 24pt; }
  /* Glassmorphism overrides */
  [style*="rgba"] {
    background: white !important;
    border-color: #e5e7eb !important;
    box-shadow: none !important;
  }
  /* Typography */
  * {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
`;

// ─── Backend types ─────────────────────────────────────────────────────────────
interface BackendReason {
  title: string; category: string; severity: string; affected_claims: number;
}
interface BackendReport {
  filename: string; risk_level: string; risk_score: number; risk_color: string;
  reasons: BackendReason[];
  claim_breakdown: { total: number; verified: number; partially_verified: number; not_verified: number };
}
interface BackendResponse { success: boolean; page_count: number; report: BackendReport; }

import { API_ENDPOINTS } from "@/lib/api";
const API_URL = API_ENDPOINTS.greenwashingPdf;

function mapToResults(res: BackendResponse): ResultsData {
  const { report } = res;
  const bd = report.claim_breakdown;
  const trust = Math.round(Math.min(100,
    (bd.verified / (bd.total || 1)) * 45 + (1 - report.risk_score / 100) * 35 + 0.65 * 20
  ));
  const riskColor = report.risk_score >= 75 ? "#ef4444" :
                    report.risk_score >= 50 ? "#f97316" :
                    report.risk_score >= 25 ? "#ffb300" : "#00ffaa";
  return {
    filename: report.filename, analyzed_at: new Date().toISOString(),
    page_count: res.page_count, trust_score: trust,
    carbon: { overall: Math.max(30, 100 - report.risk_score), reduction_pct: 30,
      scopes: [
        { label: "Scope 1", target: 50,  actual: 30, baseline: 2019, target_year: 2030 },
        { label: "Scope 2", target: 100, actual: 60, baseline: 2019, target_year: 2030 },
        { label: "Scope 3", target: 30,  actual: 10, baseline: 2020, target_year: 2035 },
      ] },
    greenwashing: {
      risk_level:  report.risk_level as ResultsData["greenwashing"]["risk_level"],
      risk_score:  report.risk_score, risk_color: riskColor,
      top_reasons: report.reasons.slice(0, 3).map((r: BackendReason) => r.title),
    },
    claims: { total: bd.total, verified: bd.verified,
      partially_verified: bd.partially_verified, not_verified: bd.not_verified,
      verified_list: [], rejected_list: [] },
    timeline: report.reasons.map((r: BackendReason, i: number) => ({
      page: i + 1, claim: r.title, category: r.category,
      verdict: (r.severity === "critical" || r.severity === "high") ? "not_verified" as const : "partially_verified" as const,
      confidence: r.affected_claims > 0 ? 0.4 : 0.6,
    })),
  };
}

import { downloadPdfReport } from "@/lib/pdfExporter";
import { useApp } from "@/context/AppContext";

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AuditPage() {
  const { state: appState, analyzePDF, isAnalyzing, progress: appProgress, errorMsg: appError } = useApp();
  const inputRef                  = useRef<HTMLInputElement>(null);
  const [localProgress, setProgress] = useState(0);
  const [localError, setErrorMsg]  = useState("");
  const [localReport, setReport]  = useState<AuditReport | null>(null);

  const report = localReport || (appState.greenwashing ? buildAuditReport(mapToResults(appState.greenwashing as unknown as BackendResponse)) : buildAuditReport(DEMO_RESULTS));
  const isDemo = !localReport && !appState.greenwashing;
  const uploading = isAnalyzing;
  const progress = isAnalyzing ? appProgress : localProgress;
  const displayError = localError || (uploading ? appError : "");

  const handleDownloadPdf = () => {
    const gwReport = appState.greenwashing?.report;
    
    const claimsList = [
      ...(report.claims.verified_list || []).map((c: any) => ({
        claim: c.text,
        category: c.category,
        confidence: c.confidence,
        status: c.verdict || "verified",
        page: c.page,
      })),
      ...(report.claims.rejected_list || []).map((c: any) => ({
        claim: c.text,
        category: c.category,
        confidence: c.confidence,
        status: c.verdict || "unverified",
        page: c.page,
      })),
    ];

    const reasons = gwReport?.reasons
      ? gwReport.reasons.map((r: any) => ({
          title: r.title,
          detail: r.description,
          severity: r.severity,
          category: r.category,
        }))
      : (report.greenwashing.top_reasons || []).map((t: string) => ({
          title: t,
          detail: "Flagged risk indicator requiring third-party verification and documentation.",
          severity: "medium",
        }));

    const recommendations = gwReport?.recommendations
      ? gwReport.recommendations.map((r: any) => ({
          action: r.action,
          rationale: r.rationale,
          priority: r.priority,
          category: r.category,
        }))
      : [
          { action: "Publish Scope 1, 2, and 3 emissions inventory with base year documentation.", priority: "high" },
          { action: "Obtain independent third-party verification (ISO 14064-3 assurance) for all published targets.", priority: "high" },
          { action: "Provide specific numeric thresholds and measurement units for all environmental claims.", priority: "medium" },
        ];

    downloadPdfReport({
      filename: report.filename,
      reportId: report.report_id,
      classification: report.classification,
      period: report.period,
      preparedBy: report.prepared_by,
      analyzedAt: report.analyzed_at,
      pageCount: report.page_count,
      trustScore: report.trust_score,
      riskScore: report.greenwashing.risk_score,
      riskLevel: report.greenwashing.risk_level,
      totalClaims: report.claims.total,
      verifiedClaims: report.claims.verified,
      unverifiedClaims: report.claims.not_verified,
      summary: gwReport?.summary || `This sustainability audit was conducted by the EcoLabel X AI Audit Engine against '${report.filename}' (${report.page_count} pages, ${report.claims.total} claims analyzed). Overall Trust Score is ${report.trust_score}/100 with a ${report.greenwashing.risk_level} Risk level (${report.greenwashing.risk_score}/100).`,
      claimsList,
      reasons,
      recommendations,
    });
  };

  const handleFile = useCallback((file: File) => {
    setErrorMsg("");
    analyzePDF(file);
  }, [analyzePDF]);

  return (
    <>
      {/* Print styles — injected into <head> via React */}
      <style dangerouslySetInnerHTML={{ __html: PRINT_STYLES }} />

      <DashboardTopNav
        title="Audit Report"
        subtitle="Formal sustainability audit with claims, evidence, and recommendations."
      />

      <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* ── Control bar (hidden in print) ── */}
        <div
          id="audit-controls"
          className="mb-5 rounded-2xl px-5 py-3 flex flex-wrap items-center gap-3 print:hidden"
          style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-lg" aria-hidden="true">📋</span>
              <p className="text-sm font-semibold text-slate-300 truncate">{report.filename}</p>
              {isDemo && (
                <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide"
                  style={{ background: "rgba(155,89,255,0.15)", color: "#9b59ff", border: "1px solid rgba(155,89,255,0.3)" }}>
                  Demo
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-600 mt-0.5">
              {report.report_id} · {report.classification} · {report.period}
            </p>
          </div>

          {uploading && (
            <div className="flex items-center gap-3">
              <div className="w-36 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
                <div className="h-full rounded-full transition-all duration-300"
                     style={{ width: `${progress}%`, background: "linear-gradient(90deg,#9b59ff,#00ffaa)" }} />
              </div>
              <span className="text-[10px] text-slate-500">{Math.round(progress)}%</span>
            </div>
          )}

          {displayError && <span className="text-[11px] text-red-400">⚠ {displayError}</span>}

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:opacity-95 shadow-md"
              style={{ background: "linear-gradient(135deg,#00ffaa,#9b59ff)", color: "#050a18" }}
              aria-label="Download executive audit report as PDF"
            >
              <PrinterIcon /> Download PDF
            </button>
            <button
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{ background: "rgba(155,89,255,0.1)", color: "#9b59ff", border: "1px solid rgba(155,89,255,0.3)" }}
            >
              <UploadIcon /> Analyze PDF
            </button>
          </div>
        </div>

        {/* ── Audit Document ── */}
        <div
          id="audit-document"
          className="rounded-2xl overflow-hidden mx-auto print:rounded-none print:shadow-none print:border-none"
          style={{
            background:   "rgba(255,255,255,0.025)",
            border:       "1px solid rgba(255,255,255,0.08)",
            boxShadow:    "0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
            maxWidth:     "900px",
          }}
        >
          <div className="p-6 sm:p-8 space-y-10">

            {/* Letterhead */}
            <AuditHeader report={report} />

            {/* Section 1 */}
            <ExecutiveSummary report={report} />

            {/* Section 2 */}
            <div className="audit-page-break">
              <ClaimsTable report={report} />
            </div>

            {/* Section 3 */}
            <div className="audit-page-break">
              <EvidenceSection report={report} />
            </div>

            {/* Section 4 */}
            <div className="audit-page-break">
              <TrustScoreSection report={report} />
            </div>

            {/* Section 5 */}
            <div className="audit-page-break">
              <RecommendationsSection report={report} />
            </div>

            {/* Document footer */}
            <footer
              className="pt-6 border-t text-center text-[9px] text-slate-600 print:text-gray-400 space-y-1 print:border-gray-200"
              style={{ borderColor: "rgba(255,255,255,0.06)" }}
            >
              <p>
                <strong className="text-slate-500 print:text-gray-500">EcoLabel X</strong> — AI-Powered Sustainability Audit Engine
                · Report {report.report_id} · {new Date(report.analyzed_at).toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })}
              </p>
              <p>This report is classified {report.classification} and intended solely for the named recipient.</p>
            </footer>

          </div>
        </div>

        <input
          ref={inputRef} type="file" accept=".pdf,application/pdf"
          className="sr-only" aria-label="PDF file input"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
      </main>
    </>
  );
}

function PrinterIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
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
