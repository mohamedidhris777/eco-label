/**
 * EcoLabel X — Audit Section 2: Claims Table
 * Full sortable table of all claims with verdict, category, page, confidence.
 */
"use client";

import { useMemo, useState } from "react";
import { SectionTitle } from "./ExecutiveSummary";
import { VERDICT_COLORS, type AuditReport } from "./types";
import { CATEGORY_CONFIG, type ClaimCategory } from "@/components/claims/types";
import { type ClaimVerdict } from "@/components/results/types";

type SortField = "page" | "category" | "verdict" | "confidence";
type SortDir   = "asc" | "desc";

export function ClaimsTable({ report }: { report: AuditReport }) {
  const [sortField, setSortField] = useState<SortField>("page");
  const [sortDir,   setSortDir]   = useState<SortDir>("asc");
  const [verdictFilter, setVerdictFilter] = useState<ClaimVerdict | "all">("all");

  const allClaims = useMemo(() => report.timeline.map((t, i) => ({
    id:         i + 1,
    text:       t.claim,
    page:       t.page,
    category:   t.category,
    verdict:    t.verdict,
    confidence: t.confidence,
  })), [report.timeline]);

  const visible = useMemo(() => {
    const filtered = verdictFilter === "all"
      ? allClaims
      : allClaims.filter((c) => c.verdict === verdictFilter);

    return [...filtered].sort((a, b) => {
      let va: string | number = a[sortField];
      let vb: string | number = b[sortField];
      if (typeof va === "string") va = va.toLowerCase();
      if (typeof vb === "string") vb = vb.toLowerCase();
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ?  1 : -1;
      return 0;
    });
  }, [allClaims, sortField, sortDir, verdictFilter]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  const SortIcon = ({ field }: { field: SortField }) => (
    <span className="ml-1 text-[9px] opacity-50" aria-hidden="true">
      {sortField === field ? (sortDir === "asc" ? "▲" : "▼") : "⇅"}
    </span>
  );

  const verdictCounts: Record<ClaimVerdict, number> = {
    verified:           allClaims.filter((c) => c.verdict === "verified").length,
    partially_verified: allClaims.filter((c) => c.verdict === "partially_verified").length,
    not_verified:       allClaims.filter((c) => c.verdict === "not_verified").length,
  };

  return (
    <section className="audit-section" aria-labelledby="claims-heading">
      <SectionTitle n={2} id="claims-heading">Claims Analysis</SectionTitle>

      {/* Filter bar — hidden in print */}
      <div className="flex flex-wrap items-center gap-2 mb-4 print:hidden">
        {(["all", "verified", "partially_verified", "not_verified"] as const).map((v) => {
          const active = verdictFilter === v;
          const color  = v === "all" ? "#64748b" : VERDICT_COLORS[v].color;
          const count  = v === "all" ? allClaims.length : verdictCounts[v];
          return (
            <button
              key={v}
              onClick={() => setVerdictFilter(v)}
              aria-pressed={active}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold transition-all"
              style={{
                color:      active ? "#050a18" : color,
                background: active ? color      : `${color}12`,
                border:     `1px solid ${active ? color : `${color}40`}`,
              }}
            >
              {v !== "all" && <span aria-hidden="true">{VERDICT_COLORS[v].icon}</span>}
              {v === "all" ? "All" : v === "partially_verified" ? "Partial" : v.charAt(0).toUpperCase() + v.slice(1).replace(/_/g, " ")}
              <span className="opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl print:rounded-none" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
        <table className="w-full text-[11px] border-collapse print:border print:border-gray-200" aria-label="Claims analysis table">
          <thead>
            <tr className="text-[9px] uppercase tracking-widest text-slate-600 print:text-gray-500"
                style={{ background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              <th className="px-3 py-2.5 text-left w-8 print:border-b print:border-gray-200">#</th>
              <th className="px-3 py-2.5 text-left print:border-b print:border-gray-200">Sustainability Claim</th>
              <th
                className="px-3 py-2.5 text-left cursor-pointer hover:text-slate-400 transition-colors print:border-b print:border-gray-200"
                onClick={() => toggleSort("category")}
              >Category <SortIcon field="category" /></th>
              <th
                className="px-3 py-2.5 text-center cursor-pointer hover:text-slate-400 transition-colors print:border-b print:border-gray-200"
                onClick={() => toggleSort("page")}
              >Page <SortIcon field="page" /></th>
              <th
                className="px-3 py-2.5 text-center cursor-pointer hover:text-slate-400 transition-colors print:border-b print:border-gray-200"
                onClick={() => toggleSort("verdict")}
              >Verdict <SortIcon field="verdict" /></th>
              <th
                className="px-3 py-2.5 text-right cursor-pointer hover:text-slate-400 transition-colors print:border-b print:border-gray-200"
                onClick={() => toggleSort("confidence")}
              >Confidence <SortIcon field="confidence" /></th>
            </tr>
          </thead>
          <tbody>
            {visible.map((claim, idx) => {
              const vc  = VERDICT_COLORS[claim.verdict];
              const cat = CATEGORY_CONFIG[claim.category as ClaimCategory] ?? { icon: "🌍", label: claim.category };
              const pct = Math.round(claim.confidence * 100);
              const even = idx % 2 === 0;
              return (
                <tr
                  key={claim.id}
                  style={{
                    background: even ? "rgba(255,255,255,0.01)" : "transparent",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                  }}
                  className="print:border-b print:border-gray-100"
                >
                  <td className="px-3 py-2.5 text-slate-700 print:text-gray-400 tabular-nums">{claim.id}</td>
                  <td className="px-3 py-2.5 text-slate-300 print:text-gray-800 max-w-xs">
                    <span className="leading-snug">{claim.text}</span>
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <span className="flex items-center gap-1 text-slate-500 print:text-gray-500">
                      <span aria-hidden="true">{cat.icon}</span>
                      <span className="capitalize">{cat.label ?? claim.category}</span>
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-center tabular-nums text-slate-500 print:text-gray-500">{claim.page}</td>
                  <td className="px-3 py-2.5 text-center">
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold print:border"
                      style={{
                        color:            vc.color,
                        background:       vc.bg,
                        border:           `1px solid ${vc.border}`,
                        printColorAdjust: "exact",
                      }}
                    >
                      {vc.icon} {claim.verdict === "partially_verified" ? "Partial" : claim.verdict.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-12 h-1 rounded-full overflow-hidden print:border print:border-gray-200"
                           style={{ background: "rgba(255,255,255,0.06)" }}>
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${pct}%`, background: vc.color }}
                        />
                      </div>
                      <span className="tabular-nums font-semibold" style={{ color: vc.color, minWidth: "2.5rem", textAlign: "right" }}>
                        {pct}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {visible.length === 0 && (
          <div className="text-center py-8 text-slate-600 text-sm">No claims match the selected filter.</div>
        )}
      </div>

      {/* Summary stats */}
      <div className="mt-3 flex flex-wrap gap-4 text-[10px] text-slate-600 print:text-gray-400">
        <span>Total: <strong className="text-slate-400 print:text-gray-600">{allClaims.length}</strong></span>
        {(["verified", "partially_verified", "not_verified"] as ClaimVerdict[]).map((v) => (
          <span key={v} style={{ color: VERDICT_COLORS[v].color }}>
            {v.replace(/_/g, " ")}: <strong>{verdictCounts[v]}</strong>
          </span>
        ))}
      </div>
    </section>
  );
}
