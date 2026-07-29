/**
 * EcoLabel X — Audit Section 5: Recommendations
 * Prioritised action items derived from greenwashing risk analysis.
 */
import { SectionTitle } from "./ExecutiveSummary";
import { PRIORITY_COLOR, PRIORITY_LABEL, type Priority, type AuditReport } from "./types";

// Fallback recommendations when greenwashing.top_reasons is sparse
const UNIVERSAL_RECS = [
  {
    priority: "high" as Priority,
    action: "Commission independent third-party assurance",
    rationale: "Sustainability disclosures carry significantly more credibility when independently assured to ISAE 3000 or AA1000AS standard.",
    category: "verification",
  },
  {
    priority: "medium" as Priority,
    action: "Adopt a recognised reporting framework (GRI, TCFD, or CSRD)",
    rationale: "Structured reporting frameworks reduce greenwashing risk by mandating specific disclosures, boundary definitions, and assured data.",
    category: "reporting",
  },
  {
    priority: "low" as Priority,
    action: "Schedule annual re-audit",
    rationale: "Year-on-year analysis tracks improvement in claim verifiability and trust score, supporting continuous disclosure improvement.",
    category: "governance",
  },
];

export function RecommendationsSection({ report }: { report: AuditReport }) {
  // Build from greenwashing reasons; fall back to universal recs
  const recs = report.greenwashing.top_reasons.length > 0
    ? report.greenwashing.top_reasons.map((reason, i) => ({
        priority: (i === 0 ? "critical" : i === 1 ? "high" : "medium") as Priority,
        action:   reason,
        rationale: "This was identified as a primary greenwashing risk signal in the automated analysis.",
        category: "remediation",
      }))
    : [];

  const combined = [...recs, ...UNIVERSAL_RECS];

  const _priorityOrder: Record<Priority, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  const sorted = [...combined].sort((a, b) =>
    _priorityOrder[a.priority] - _priorityOrder[b.priority]
  );

  return (
    <section className="audit-section" aria-labelledby="recs-heading">
      <SectionTitle n={5} id="recs-heading">Recommendations</SectionTitle>

      <p className="text-sm text-slate-400 print:text-gray-600 leading-relaxed mb-5">
        The following recommendations are prioritised by urgency. Critical and High priority items should be
        addressed before the next reporting cycle. Medium and Low items represent ongoing improvement opportunities.
      </p>

      <div className="space-y-3">
        {sorted.map((rec, i) => {
          const color = PRIORITY_COLOR[rec.priority];
          return (
            <div
              key={i}
              className="rounded-xl p-4 flex gap-4 no-break print:rounded print:border print:border-gray-100"
              style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              {/* Number */}
              <div
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold print:border"
                style={{ background: `${color}18`, color, border: `1px solid ${color}40` }}
                aria-hidden="true"
              >
                {i + 1}
              </div>

              <div className="flex-1 space-y-1.5">
                {/* Priority + category */}
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide print:border"
                    style={{ color, background: `${color}15`, border: `1px solid ${color}35` }}
                  >
                    {PRIORITY_LABEL[rec.priority]}
                  </span>
                  <span className="text-[9px] text-slate-600 print:text-gray-400 capitalize">{rec.category}</span>
                </div>

                {/* Action */}
                <p className="text-sm font-semibold text-slate-200 print:text-gray-800">{rec.action}</p>

                {/* Rationale */}
                <p className="text-[11px] text-slate-500 print:text-gray-500 leading-relaxed">{rec.rationale}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Disclaimer */}
      <div
        className="mt-8 rounded-xl p-4 text-[10px] text-slate-600 print:text-gray-400 leading-relaxed print:border print:border-gray-200 print:rounded"
        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
      >
        <strong className="text-slate-500 print:text-gray-600">Disclaimer:</strong> This audit report was generated automatically
        by the EcoLabel X AI Audit Engine using rule-based heuristics and natural language pattern matching. It does not
        constitute legal advice and should not be used as the sole basis for regulatory compliance decisions. Results should
        be reviewed by a qualified sustainability professional before publication.
      </div>
    </section>
  );
}
