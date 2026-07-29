/**
 * EcoLabel X — Audit: Report Letterhead
 */
import { type AuditReport } from "./types";
import { trustColor, RISK_COLORS } from "@/components/results/types";

interface AuditHeaderProps {
  report: AuditReport;
}

export function AuditHeader({ report }: AuditHeaderProps) {
  const dateStr = new Date(report.analyzed_at).toLocaleDateString("en-GB", {
    year: "numeric", month: "long", day: "numeric",
  });
  const tc = trustColor(report.trust_score);
  const rc = RISK_COLORS[report.greenwashing.risk_level];

  const meta = [
    ["Report ID",          report.report_id],
    ["Classification",     report.classification],
    ["Date of Issue",      dateStr],
    ["Prepared By",        report.prepared_by],
    ["Document Version",   report.version],
    ["Analysis Period",    report.period],
    ["Pages Analysed",     String(report.page_count)],
    ["Claims Analysed",    String(report.claims.total)],
  ];

  return (
    <div className="audit-header no-break">
      {/* Letterhead */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl font-bold" style={{ color: "#00ffaa", fontFamily: "inherit" }}>
              EcoLabel X
            </span>
            <span className="text-xs text-gray-400 print:text-gray-500 font-normal">
              Sustainability Intelligence Platform
            </span>
          </div>
          <p className="text-[11px] text-gray-400 print:text-gray-500">
            AI-Powered Greenwashing Detection & Audit
          </p>
        </div>
        <div className="text-right">
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded border text-[10px] font-bold uppercase tracking-widest print:border-gray-400 print:text-gray-700"
            style={{ borderColor: "rgba(239,68,68,0.4)", color: "#ef4444" }}
          >
            🔒 Confidential
          </div>
        </div>
      </div>

      {/* Title block */}
      <div
        className="rounded-2xl print:rounded-none p-6 mb-6 print:p-0 print:pb-4 print:border-b-2 print:border-gray-300"
        style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <p className="text-[9px] uppercase tracking-[3px] text-slate-500 print:text-gray-400 mb-2">
          Sustainability Audit Report
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-white print:text-gray-900 leading-tight mb-2">
          {report.filename.replace(/\.pdf$/i, "")}
        </h1>
        <p className="text-sm text-slate-400 print:text-gray-500">{report.filename}</p>

        {/* Headline KPIs */}
        <div className="flex flex-wrap gap-4 mt-5">
          {[
            { label: "Trust Score",   value: `${report.trust_score}/100`, color: tc },
            { label: "Risk Level",    value: report.greenwashing.risk_level, color: rc },
            { label: "Verified",      value: String(report.claims.verified), color: "#00ffaa" },
            { label: "Not Verified",  value: String(report.claims.not_verified), color: "#ef4444" },
          ].map(({ label, value, color }) => (
            <div key={label}
              className="text-center px-4 py-2 rounded-xl print:border print:border-gray-300 print:rounded"
              style={{ background: `${color}10`, border: `1px solid ${color}25` }}
            >
              <p className="text-[8px] uppercase tracking-widest text-slate-500 print:text-gray-400 mb-0.5">
                {label}
              </p>
              <p className="text-lg font-bold print:text-gray-900" style={{ color }}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Metadata grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-2.5 text-[11px] mb-6 pb-6 border-b border-white/8 print:border-gray-200">
        {meta.map(([label, value]) => (
          <div key={label}>
            <p className="text-slate-600 print:text-gray-400 uppercase tracking-wide text-[9px] mb-0.5">{label}</p>
            <p className="text-slate-300 print:text-gray-800 font-semibold">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
