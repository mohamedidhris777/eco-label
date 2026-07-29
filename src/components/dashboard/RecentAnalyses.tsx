/**
 * EcoLabel X — Recent Analyses Table
 *
 * Paginated table of the last product scans with EcoScore rings,
 * status badges, delta indicators, and row-level actions.
 */
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";

// ─── Types & Data ─────────────────────────────────────────────────────────────

type AnalysisStatus = "verified" | "pending" | "flagged" | "expired";

interface Analysis {
  id:         string;
  product:    string;
  brand:      string;
  category:   string;
  score:      number;
  delta:      number;
  status:     AnalysisStatus;
  labels:     number;
  carbon:     string;
  analysedAt: string;
}

const STATUS_CONFIG: Record<AnalysisStatus, { label: string; color: string; bg: string }> = {
  verified: { label: "Verified", color: "#00ffaa", bg: "rgba(0,255,170,0.1)"   },
  pending:  { label: "Pending",  color: "#ffb300", bg: "rgba(255,179,0,0.1)"   },
  flagged:  { label: "Flagged",  color: "#ef4444", bg: "rgba(239,68,68,0.1)"   },
  expired:  { label: "Expired",  color: "#64748b", bg: "rgba(100,116,139,0.1)" },
};

const DATA: Analysis[] = [
  { id: "1",  product: "Organic Oat Milk 1L",       brand: "Oatly",         category: "Beverage",    score: 92, delta:  4, status: "verified", labels: 5, carbon: "1.2 kg",   analysedAt: "2m ago"  },
  { id: "2",  product: "Bamboo Fibre T-Shirt",       brand: "Allbirds",      category: "Apparel",     score: 78, delta:  2, status: "verified", labels: 3, carbon: "3.8 kg",   analysedAt: "18m ago" },
  { id: "3",  product: "EcoFresh Dish Soap 500ml",   brand: "Method",        category: "Household",   score: 61, delta: -6, status: "flagged",  labels: 2, carbon: "0.9 kg",   analysedAt: "1h ago"  },
  { id: "4",  product: "Reusable Water Bottle",      brand: "Klean Kanteen", category: "Household",   score: 88, delta:  1, status: "verified", labels: 4, carbon: "2.1 kg",   analysedAt: "2h ago"  },
  { id: "5",  product: "Wild Berry Granola Bar",     brand: "Lärabar",       category: "Food",        score: 74, delta:  0, status: "pending",  labels: 2, carbon: "0.6 kg",   analysedAt: "4h ago"  },
  { id: "6",  product: "Shea Butter Body Lotion",    brand: "The Body Shop", category: "Beauty",      score: 83, delta:  3, status: "verified", labels: 6, carbon: "1.8 kg",   analysedAt: "5h ago"  },
  { id: "7",  product: "Recycled PET Fleece Jacket", brand: "Patagonia",     category: "Apparel",     score: 95, delta:  5, status: "verified", labels: 7, carbon: "5.2 kg",   analysedAt: "8h ago"  },
  { id: "8",  product: "Fair Trade Dark Chocolate",  brand: "Tony's",        category: "Food",        score: 89, delta:  2, status: "verified", labels: 4, carbon: "0.4 kg",   analysedAt: "12h ago" },
  { id: "9",  product: "GreenPack Carry Bags",       brand: "EcoGreen",      category: "Packaging",   score: 48, delta: -9, status: "flagged",  labels: 1, carbon: "0.3 kg",   analysedAt: "1d ago"  },
  { id: "10", product: "Lavender Essential Oil",     brand: "Aura Cacia",    category: "Beauty",      score: 71, delta: -2, status: "expired",  labels: 2, carbon: "0.2 kg",   analysedAt: "2d ago"  },
];

const PAGE_SIZE = 6;

// ─── Mini Score Ring ──────────────────────────────────────────────────────────

function MiniScoreRing({ score }: { score: number }) {
  const color =
    score >= 90 ? "#00ffaa" :
    score >= 75 ? "#ffb300" :
    score >= 55 ? "#94a3b8" :
                  "#ef4444";
  const r    = 14;
  const circ = 2 * Math.PI * r;
  return (
    <div className="relative flex-shrink-0" style={{ width: 36, height: 36 }}>
      <svg width={36} height={36} viewBox="0 0 36 36" className="-rotate-90" aria-hidden="true">
        <circle cx={18} cy={18} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
        <circle
          cx={18} cy={18} r={r}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - score / 100)}
          style={{ filter: `drop-shadow(0 0 3px ${color}70)` }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[10px] font-bold" style={{ color }}>{score}</span>
      </div>
    </div>
  );
}

// ─── Table Row ────────────────────────────────────────────────────────────────

function AnalysisRow({ row }: { row: Analysis }) {
  const cfg = STATUS_CONFIG[row.status];

  return (
    <tr className="group border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.02)] transition-colors">
      {/* Product */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <MiniScoreRing score={row.score} />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white truncate">{row.product}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">{row.brand}</p>
          </div>
        </div>
      </td>

      {/* Category */}
      <td className="py-3 px-4 hidden md:table-cell">
        <span className="text-[10px] text-slate-400 px-2 py-0.5 rounded-md" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
          {row.category}
        </span>
      </td>

      {/* Delta */}
      <td className="py-3 px-4 hidden lg:table-cell">
        <span
          className={cn(
            "text-[10px] font-semibold",
            row.delta > 0 ? "text-[#00ffaa]" : row.delta < 0 ? "text-red-400" : "text-slate-500"
          )}
        >
          {row.delta > 0 ? `+${row.delta}` : row.delta === 0 ? "±0" : row.delta}
        </span>
      </td>

      {/* Status */}
      <td className="py-3 px-4">
        <span
          className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
          style={{ color: cfg.color, background: cfg.bg }}
        >
          <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: cfg.color }} />
          {cfg.label}
        </span>
      </td>

      {/* Labels */}
      <td className="py-3 px-4 hidden lg:table-cell">
        <span className="text-xs text-slate-400">{row.labels}</span>
      </td>

      {/* Carbon */}
      <td className="py-3 px-4 hidden xl:table-cell">
        <span className="text-[11px] text-[#00c8ff] font-medium">{row.carbon}</span>
      </td>

      {/* Time */}
      <td className="py-3 px-4 hidden sm:table-cell">
        <span className="text-[10px] text-slate-600 whitespace-nowrap">{row.analysedAt}</span>
      </td>

      {/* Actions */}
      <td className="py-3 px-4">
        <button
          className="opacity-0 group-hover:opacity-100 text-[10px] text-[#00ffaa] hover:underline transition-opacity"
          aria-label={`View analysis for ${row.product}`}
        >
          View →
        </button>
      </td>
    </tr>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function RecentAnalyses() {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(DATA.length / PAGE_SIZE);
  const rows = DATA.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <section aria-labelledby="recent-heading">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <h2 id="recent-heading" className="font-display font-semibold text-white text-sm">
          Recent Analyses
          <span className="ml-2 text-xs font-normal text-slate-500">{DATA.length} products</span>
        </h2>
        <div className="flex items-center gap-3">
          <button className="text-[11px] text-slate-500 hover:text-white transition-colors">Export CSV</button>
          <button className="text-[11px] text-[#00ffaa] hover:underline">View all →</button>
        </div>
      </div>

      {/* Table */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full" aria-label="Recent product analyses">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.07)]">
                {[
                  { label: "Product",   cls: "" },
                  { label: "Category",  cls: "hidden md:table-cell" },
                  { label: "Δ Score",   cls: "hidden lg:table-cell" },
                  { label: "Status",    cls: "" },
                  { label: "Labels",    cls: "hidden lg:table-cell" },
                  { label: "Carbon",    cls: "hidden xl:table-cell" },
                  { label: "Analysed",  cls: "hidden sm:table-cell" },
                  { label: "",          cls: "" },
                ].map(({ label, cls }) => (
                  <th
                    key={label || "actions"}
                    className={cn("py-3 px-4 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest whitespace-nowrap", cls)}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <AnalysisRow key={row.id} row={row} />
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-[rgba(255,255,255,0.06)]">
          <p className="text-[10px] text-slate-600">
            Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, DATA.length)} of {DATA.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-[rgba(255,255,255,0.06)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              aria-label="Previous page"
            >
              <ChevLeft />
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={cn(
                  "w-7 h-7 rounded-lg text-[11px] font-medium transition-all",
                  i === page
                    ? "bg-[rgba(0,255,170,0.12)] text-[#00ffaa] border border-[rgba(0,255,170,0.25)]"
                    : "text-slate-500 hover:text-white hover:bg-[rgba(255,255,255,0.06)]"
                )}
                aria-current={i === page ? "page" : undefined}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page === totalPages - 1}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-[rgba(255,255,255,0.06)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              aria-label="Next page"
            >
              <ChevRight />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────
function ChevLeft() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}
function ChevRight() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
