/**
 * EcoLabel X — Verification Module: Filter Bar
 * Verdict toggles, category filter, confidence slider, text search, export.
 */
"use client";

import { ALL_CATEGORIES, CATEGORY_CONFIG, type ClaimCategory } from "@/components/claims/types";
import { VERDICT_CONFIG, type Verdict } from "./types";

export interface VerificationFiltersState {
  verdicts:      Set<Verdict>;
  categories:    Set<string>;
  minConfidence: number;   // 0–100
  search:        string;
  sortBy:        "confidence" | "page" | "verdict";
}

interface VerificationFiltersProps {
  filters:       VerificationFiltersState;
  onChange:      (next: VerificationFiltersState) => void;
  totalFiltered: number;
  totalAll:      number;
  onExport:      () => void;
}

const ALL_VERDICTS: Verdict[] = ["verified", "partially_verified", "not_verified"];

export function VerificationFilters({
  filters,
  onChange,
  totalFiltered,
  totalAll,
  onExport,
}: VerificationFiltersProps) {

  const toggleVerdict = (v: Verdict) => {
    const next = new Set(filters.verdicts);
    if (next.has(v)) {
      if (next.size === 1) return;
      next.delete(v);
    } else {
      next.add(v);
    }
    onChange({ ...filters, verdicts: next });
  };

  const toggleCategory = (cat: string) => {
    const next = new Set(filters.categories);
    if (next.has(cat)) {
      if (next.size === 1) return;
      next.delete(cat);
    } else {
      next.add(cat);
    }
    onChange({ ...filters, categories: next });
  };

  const allCatsSelected = filters.categories.size === ALL_CATEGORIES.length;

  return (
    <div
      className="rounded-2xl p-4 space-y-4"
      style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      {/* ── Search + Sort + Export ── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
          <input
            type="search"
            placeholder="Search claims or evidence…"
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="w-full pl-8 pr-3 py-2 rounded-xl text-xs text-slate-200 placeholder-slate-600 outline-none"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}
            aria-label="Search claims"
          />
        </div>

        <select
          value={filters.sortBy}
          onChange={(e) => onChange({ ...filters, sortBy: e.target.value as VerificationFiltersState["sortBy"] })}
          className="py-2 px-3 rounded-xl text-xs text-slate-300 outline-none cursor-pointer"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}
          aria-label="Sort by"
        >
          <option value="verdict">Sort: Verdict</option>
          <option value="confidence">Sort: Confidence</option>
          <option value="page">Sort: Page</option>
        </select>

        <span className="text-[11px] text-slate-500 tabular-nums">
          {totalFiltered}/{totalAll}
        </span>

        <button
          onClick={onExport}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-semibold text-[#00ffaa] border border-[rgba(0,255,170,0.25)] hover:bg-[rgba(0,255,170,0.06)] transition-all"
          aria-label="Export verification results as JSON"
        >
          <DownloadIcon />
          Export JSON
        </button>
      </div>

      {/* ── Min confidence ── */}
      <div className="flex items-center gap-4">
        <span className="text-[10px] uppercase tracking-widest text-slate-600 flex-shrink-0 w-28">
          Min confidence
        </span>
        <input
          type="range" min={0} max={95} step={5}
          value={filters.minConfidence}
          onChange={(e) => onChange({ ...filters, minConfidence: Number(e.target.value) })}
          className="flex-1 accent-[#00ffaa] cursor-pointer h-1"
          aria-label={`Minimum confidence: ${filters.minConfidence}%`}
        />
        <span
          className="text-[11px] font-bold tabular-nums w-10 text-right"
          style={{
            color: filters.minConfidence >= 65 ? "#00ffaa"
                 : filters.minConfidence >= 40 ? "#ffb300"
                 : "#ef4444",
          }}
        >
          {filters.minConfidence}%
        </span>
      </div>

      {/* ── Verdict chips ── */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by verdict">
        {ALL_VERDICTS.map((v) => {
          const cfg      = VERDICT_CONFIG[v];
          const selected = filters.verdicts.has(v);
          return (
            <button
              key={v}
              onClick={() => toggleVerdict(v)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold transition-all duration-150"
              style={{
                color:      selected ? "#050a18" : cfg.color,
                background: selected ? cfg.color  : cfg.bg,
                border:     `1px solid ${selected ? cfg.color : cfg.border}`,
              }}
              aria-pressed={selected}
              aria-label={`Filter: ${cfg.label}`}
            >
              <span aria-hidden="true">{cfg.icon}</span>
              {cfg.label}
            </button>
          );
        })}
      </div>

      {/* ── Category chips ── */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        <button
          onClick={() =>
            onChange({
              ...filters,
              categories: allCatsSelected
                ? new Set([ALL_CATEGORIES[0]])
                : new Set(ALL_CATEGORIES),
            })
          }
          className="px-2.5 py-0.5 rounded-full text-[9px] font-semibold transition-all"
          style={{
            color:      allCatsSelected ? "#050a18"  : "#64748b",
            background: allCatsSelected ? "#00ffaa"  : "rgba(255,255,255,0.05)",
            border:     `1px solid ${allCatsSelected ? "#00ffaa" : "rgba(255,255,255,0.1)"}`,
          }}
          aria-pressed={allCatsSelected}
        >
          All categories
        </button>

        {ALL_CATEGORIES.map((cat) => {
          const cfg      = CATEGORY_CONFIG[cat as ClaimCategory];
          const selected = filters.categories.has(cat);
          return (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold transition-all"
              style={{
                color:      selected ? "#050a18" : cfg.color,
                background: selected ? cfg.color  : cfg.bg,
                border:     `1px solid ${selected ? cfg.color : cfg.border}`,
                opacity:    selected ? 1 : 0.6,
              }}
              aria-pressed={selected}
            >
              <span aria-hidden="true">{cfg.icon}</span>
              {cfg.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}
