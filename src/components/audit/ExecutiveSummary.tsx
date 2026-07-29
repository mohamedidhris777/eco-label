/**
 * EcoLabel X — Audit Section 1: Executive Summary
 */
import { type AuditReport } from "./types";
import { trustColor, RISK_COLORS } from "@/components/results/types";

export function ExecutiveSummary({ report }: { report: AuditReport }) {
  const tc   = trustColor(report.trust_score);
  const rc   = RISK_COLORS[report.greenwashing.risk_level];
  const vPct = Math.round((report.claims.verified / (report.claims.total || 1)) * 100);

  const narrative = [
    `This audit was conducted by the EcoLabel X AI Audit Engine on ${
      new Date(report.analyzed_at).toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })
    } against the sustainability report "${report.filename}" (${report.page_count} pages, ${report.claims.total} sustainability claims detected).`,

    `The document achieved an overall Trust Score of ${report.trust_score}/100 (Grade ${
      report.trust_score >= 80 ? "A" : report.trust_score >= 65 ? "B" :
      report.trust_score >= 50 ? "C" : report.trust_score >= 35 ? "D" : "F"
    }), with ${report.claims.verified} claims (${vPct}%) fully verified against in-document evidence, ${
      report.claims.partially_verified} partially verified, and ${report.claims.not_verified} unsubstantiated.`,

    `Greenwashing risk is assessed as ${report.greenwashing.risk_level.toUpperCase()} (score: ${
      report.greenwashing.risk_score}/100). ${
      report.greenwashing.risk_score >= 50
        ? "Material remediation is required before publication. Key concerns include unsubstantiated absolute claims, absence of third-party verification, and vague qualitative language."
        : report.greenwashing.risk_score >= 25
          ? "Moderate improvements are recommended, particularly around quantitative data disclosure and third-party certification."
          : "The disclosure is broadly credible; continued improvement in specificity is encouraged."
    }`,

    `${report.greenwashing.top_reasons.length > 0
      ? `The primary risk signals identified are: ${report.greenwashing.top_reasons.slice(0, 3).map((r) => `(i) ${r}`).join("; ")}.`
      : "No significant risk signals were identified."
    } Full details are provided in the Claims, Evidence, and Recommendations sections below.`,
  ];

  return (
    <section className="audit-section" aria-labelledby="exec-summary-heading">
      <SectionTitle n={1} id="exec-summary-heading">Executive Summary</SectionTitle>

      <div className="space-y-4">
        {narrative.map((para, i) => (
          <p key={i} className="text-sm text-slate-300 print:text-gray-700 leading-relaxed">{para}</p>
        ))}
      </div>

      {/* Key findings grid */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Overall Trust",     value: `${report.trust_score}/100`, sub: "Composite score",          color: tc },
          { label: "Greenwashing Risk", value: report.greenwashing.risk_level, sub: `Score ${report.greenwashing.risk_score}/100`, color: rc },
          { label: "Claims Verified",   value: `${vPct}%`,                  sub: `${report.claims.verified} of ${report.claims.total}`, color: "#00ffaa" },
          { label: "Cert / 3rd-Party",  value: report.greenwashing.top_reasons.length > 0 ? "Absent" : "Present",
            sub: "Independent validation", color: report.greenwashing.top_reasons.length > 0 ? "#ef4444" : "#00ffaa" },
        ].map(({ label, value, sub, color }) => (
          <div key={label}
            className="rounded-xl p-4 text-center print:border print:border-gray-200 print:rounded"
            style={{ background: `${color}08`, border: `1px solid ${color}20` }}
          >
            <p className="text-[8px] uppercase tracking-widest text-slate-600 print:text-gray-400 mb-1">{label}</p>
            <p className="text-xl font-bold print:text-gray-900" style={{ color }}>{value}</p>
            <p className="text-[10px] text-slate-600 print:text-gray-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function SectionTitle({ n, children, id }: {
  n: number; children: React.ReactNode; id?: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span
        className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold print:border print:border-gray-300 print:text-gray-600"
        style={{ background: "rgba(0,255,170,0.12)", color: "#00ffaa" }}
        aria-hidden="true"
      >{n}</span>
      <h2
        id={id}
        className="text-lg font-bold text-white print:text-gray-900 tracking-tight"
      >{children}</h2>
      <span className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} aria-hidden="true" />
    </div>
  );
}
