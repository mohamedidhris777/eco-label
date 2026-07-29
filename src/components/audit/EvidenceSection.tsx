/**
 * EcoLabel X — Audit Section 3: Evidence
 * Grouped evidence passages by category, with verdict and confidence.
 */
import { SectionTitle } from "./ExecutiveSummary";
import { VERDICT_COLORS, type AuditReport } from "./types";
import { CATEGORY_CONFIG, type ClaimCategory } from "@/components/claims/types";

export function EvidenceSection({ report }: { report: AuditReport }) {
  const withEvidence    = report.timeline.filter((e) => !!e.evidence);
  const withoutEvidence = report.timeline.filter((e) => !e.evidence && e.verdict === "not_verified");

  // Group evidence entries by category
  const grouped = withEvidence.reduce<Record<string, typeof withEvidence>>((acc, e) => {
    (acc[e.category] ??= []).push(e);
    return acc;
  }, {});

  return (
    <section className="audit-section" aria-labelledby="evidence-heading">
      <SectionTitle n={3} id="evidence-heading">Evidence Review</SectionTitle>

      <p className="text-sm text-slate-400 print:text-gray-600 leading-relaxed mb-5">
        The following passages were extracted from the source document and used to evaluate each sustainability claim.
        Evidence passages are grouped by disclosure category. Claims for which no corroborating evidence was found
        are listed separately under <em>Unsubstantiated Claims</em>.
      </p>

      {/* Grouped evidence */}
      <div className="space-y-6">
        {Object.entries(grouped).map(([cat, entries]) => {
          const catCfg = CATEGORY_CONFIG[cat as ClaimCategory] ?? { icon: "🌍", label: cat, color: "#94a3b8" };
          return (
            <div key={cat} className="no-break">
              {/* Category header */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base" aria-hidden="true">{catCfg.icon}</span>
                <h3 className="text-sm font-semibold text-white print:text-gray-800 capitalize">
                  {catCfg.label ?? cat}
                </h3>
                <span className="text-[9px] text-slate-600 print:text-gray-400">
                  ({entries.length} claim{entries.length !== 1 ? "s" : ""})
                </span>
                <span className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
              </div>

              <div className="space-y-3 pl-2">
                {entries.map((entry, i) => {
                  const vc  = VERDICT_COLORS[entry.verdict];
                  const pct = Math.round(entry.confidence * 100);
                  return (
                    <div
                      key={i}
                      className="rounded-xl p-4 print:rounded print:border print:border-gray-100"
                      style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
                    >
                      {/* Claim row */}
                      <div className="flex items-start gap-3 mb-2">
                        <span
                          className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold print:border"
                          style={{ background: vc.bg, color: vc.color, border: `1px solid ${vc.border}` }}
                          aria-label={entry.verdict.replace(/_/g, " ")}
                        >
                          {vc.icon}
                        </span>
                        <div className="flex-1">
                          <p className="text-[12px] font-medium text-slate-300 print:text-gray-800 leading-snug">
                            {entry.claim}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[9px] text-slate-600 print:text-gray-400">Page {entry.page}</span>
                            <span className="text-[9px] font-bold tabular-nums" style={{ color: vc.color }}>
                              {pct}% confidence
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Evidence passage */}
                      <blockquote
                        className="ml-8 pl-3 py-2 italic text-[11px] text-slate-400 print:text-gray-600 leading-relaxed rounded-r-lg"
                        style={{ borderLeft: `3px solid ${vc.color}50`, background: `${vc.color}05` }}
                      >
                        &ldquo;{entry.evidence}&rdquo;
                        <footer className="mt-1 text-[9px] not-italic text-slate-600 print:text-gray-400">
                          — Source document, p. {entry.page}
                        </footer>
                      </blockquote>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Unsubstantiated claims */}
      {withoutEvidence.length > 0 && (
        <div className="mt-8 no-break">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base" aria-hidden="true">✗</span>
            <h3 className="text-sm font-semibold text-white print:text-gray-800">Unsubstantiated Claims</h3>
            <span className="flex-1 h-px" style={{ background: "rgba(239,68,68,0.15)" }} />
          </div>
          <div
            className="rounded-xl overflow-hidden print:rounded print:border print:border-gray-200"
            style={{ border: "1px solid rgba(239,68,68,0.15)" }}
          >
            {withoutEvidence.map((entry, i) => (
              <div
                key={i}
                className="px-4 py-3 flex items-start gap-3 print:border-b print:border-gray-100"
                style={{ borderBottom: i < withoutEvidence.length - 1 ? "1px solid rgba(239,68,68,0.1)" : undefined }}
              >
                <span className="flex-shrink-0 text-red-500 mt-0.5 text-sm font-bold" aria-hidden="true">✗</span>
                <div>
                  <p className="text-[12px] text-slate-400 print:text-gray-700 leading-snug">{entry.claim}</p>
                  <p className="text-[9px] text-slate-600 print:text-gray-400 mt-0.5">Page {entry.page} · No corroborating evidence found</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
