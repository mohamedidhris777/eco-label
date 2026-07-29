/**
 * EcoLabel X — Audit Section 4: Trust Score
 * Score breakdown methodology + visual representation.
 */
import { SectionTitle } from "./ExecutiveSummary";
import { trustColor, type AuditReport } from "./types";

export function TrustScoreSection({ report }: { report: AuditReport }) {
  const tc    = trustColor(report.trust_score);
  const total = report.claims.total || 1;

  const grade =
    report.trust_score >= 80 ? "A" :
    report.trust_score >= 65 ? "B" :
    report.trust_score >= 50 ? "C" :
    report.trust_score >= 35 ? "D" : "F";

  const gradeLabel =
    report.trust_score >= 80 ? "Highly Trustworthy" :
    report.trust_score >= 65 ? "Trustworthy"         :
    report.trust_score >= 50 ? "Moderate"             :
    report.trust_score >= 35 ? "Questionable"         : "High Risk";

  // Score components
  const components = [
    {
      label:  "Claim Verification Score",
      desc:   `${report.claims.verified} of ${total} claims fully verified (${Math.round(report.claims.verified / total * 100)}%)`,
      weight: 45,
      earned: Math.round((report.claims.verified / total) * 45),
      color:  "#00ffaa",
    },
    {
      label:  "Greenwashing Risk Penalty",
      desc:   `Risk score ${report.greenwashing.risk_score}/100 → penalty deduction`,
      weight: 35,
      earned: Math.round((1 - report.greenwashing.risk_score / 100) * 35),
      color:  "#ffb300",
    },
    {
      label:  "Evidence Quality Score",
      desc:   "Average verification confidence across detected claims",
      weight: 20,
      earned: Math.round(0.65 * 20),
      color:  "#9b59ff",
    },
  ];

  return (
    <section className="audit-section" aria-labelledby="trust-score-heading">
      <SectionTitle n={4} id="trust-score-heading">Trust Score Assessment</SectionTitle>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Grade display */}
        <div className="sm:col-span-1 flex flex-col items-center justify-center gap-3 print:border print:border-gray-200 print:rounded p-5 rounded-2xl no-break"
             style={{ background: `${tc}08`, border: `1px solid ${tc}20` }}>
          <p className="text-[8px] uppercase tracking-[3px] text-slate-600 print:text-gray-400">Overall Grade</p>
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-5xl font-bold print:border-4"
            style={{ background: `${tc}15`, border: `3px solid ${tc}40`, color: tc }}
            aria-label={`Grade ${grade}`}
          >
            {grade}
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold" style={{ color: tc }}>{report.trust_score}<span className="text-sm text-slate-500 print:text-gray-400">/100</span></p>
            <p className="text-[11px]" style={{ color: tc }}>{gradeLabel}</p>
          </div>
        </div>

        {/* Methodology */}
        <div className="sm:col-span-2 space-y-4">
          <h3 className="text-sm font-semibold text-white print:text-gray-800 mb-2">Scoring Methodology</h3>
          <p className="text-[11px] text-slate-500 print:text-gray-500 leading-relaxed mb-4">
            The Trust Score is a composite metric computed from three weighted factors. Each factor contributes
            a maximum number of points as shown below.
          </p>

          {components.map((comp) => {
            const earnedPct = (comp.earned / comp.weight) * 100;
            return (
              <div key={comp.label} className="no-break">
                <div className="flex items-start justify-between mb-1.5">
                  <div>
                    <p className="text-[12px] font-semibold text-slate-300 print:text-gray-700">{comp.label}</p>
                    <p className="text-[10px] text-slate-600 print:text-gray-400">{comp.desc}</p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <span className="text-sm font-bold tabular-nums" style={{ color: comp.color }}>
                      {comp.earned}
                    </span>
                    <span className="text-[10px] text-slate-600 print:text-gray-400">/{comp.weight}</span>
                  </div>
                </div>
                <div
                  className="h-2 rounded-full overflow-hidden print:border print:border-gray-200"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width:      `${earnedPct}%`,
                      background: comp.color,
                      boxShadow:  `0 0 6px ${comp.color}60`,
                    }}
                  />
                </div>
              </div>
            );
          })}

          {/* Total */}
          <div
            className="flex items-center justify-between pt-4 border-t print:border-gray-300"
            style={{ borderColor: "rgba(255,255,255,0.08)" }}
          >
            <span className="text-sm font-bold text-white print:text-gray-800">Total Trust Score</span>
            <span className="text-xl font-bold" style={{ color: tc }}>
              {components.reduce((s, c) => s + c.earned, 0)}/100
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
