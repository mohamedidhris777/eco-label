/**
 * EcoLabel X — Claims Module: Filter Bar
 * Category chip toggles, confidence threshold slider, text search, and export button.
 */
"use client";

import { useMemo } from "react";
import { CATEGORY_CONFIG, ALL_CATEGORIES, type ClaimCategory } from "./types";

export interface ClaimFiltersState {
  search:          string;
  categories:      Set<ClaimCategory>;
  minConfidence:   number;   // 0–100 (integer %)
  sortBy:          "page" | "confidence";
}

interface ClaimFiltersProps {
  filters:        ClaimFiltersState;
  onChange:       (next: ClaimFiltersState) => void;
  totalFiltered:  number;
  totalAll:       number;
  onExport:       () => void;
  onExportPdf?:   () => void;
}

export function ClaimFilters({
  filters,
  onChange,
  totalFiltered,
  totalAll,
  onExport,
  onExportPdf,
}: ClaimFiltersProps) {
  const allSelected = filters.categories.size === ALL_CATEGORIES.length;

  function toggleCategory(cat: ClaimCategory) {
    const next = new Set(filters.categories);
    if (next.has(cat)) {
      if (next.size === 1) return; // keep at least one
      next.delete(cat);
    } else {
      next.add(cat);
    }
    onChange({ ...filters, categories: next });
  }

  function toggleAll() {
    onChange({
      ...filters,
      categories: allSelected
        ? new Set([ALL_CATEGORIES[0]])
        : new Set(ALL_CATEGORIES),
    });
  }

  return (
    <div
      className="rounded-2xl p-4 space-y-4"
      style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      {/* ── Search + sort + export ── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px]">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
          <input
            type="search"
            placeholder="Search claims…"
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="w-full pl-8 pr-3 py-2 rounded-xl text-xs text-slate-200 placeholder-slate-600 outline-none focus:ring-1 transition-all"
            style={{
              background: "rgba(255,255,255,0.04)",
              border:     "1px solid rgba(255,255,255,0.1)",
            }}
            aria-label="Search claim text"
          />
        </div>

        {/* Sort */}
        <select
          value={filters.sortBy}
          onChange={(e) => onChange({ ...filters, sortBy: e.target.value as "page" | "confidence" })}
          className="py-2 px-3 rounded-xl text-xs text-slate-300 outline-none cursor-pointer transition-all"
          style={{
            background: "rgba(255,255,255,0.04)",
            border:     "1px solid rgba(255,255,255,0.1)",
          }}
          aria-label="Sort claims by"
        >
          <option value="page">Sort: Page</option>
          <option value="confidence">Sort: Confidence</option>
        </select>

        {/* Result count */}
        <span className="text-[11px] text-slate-500 tabular-nums">
          {totalFiltered} / {totalAll} claims
        </span>

        {/* Download PDF */}
        {onExportPdf && (
          <button
            onClick={onExportPdf}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold text-slate-950 transition-all duration-200 shadow-md hover:scale-105"
            style={{ background: "linear-gradient(135deg, #00ffaa, #00d488)" }}
            aria-label="Download claims report as PDF"
          >
            <DownloadIcon />
            Download PDF
          </button>
        )}

        {/* Export JSON */}
        <button
          onClick={onExport}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-semibold text-slate-400 border border-white/8 hover:text-white transition-all duration-200"
          aria-label="Export filtered claims as JSON"
        >
          Export JSON
        </button>
      </div>

      {/* ── Confidence slider ── */}
      <div className="flex items-center gap-4">
        <span className="text-[10px] uppercase tracking-widest text-slate-600 flex-shrink-0 w-28">
          Min confidence
        </span>
        <input
          type="range"
          min={0}
          max={95}
          step={5}
          value={filters.minConfidence}
          onChange={(e) => onChange({ ...filters, minConfidence: Number(e.target.value) })}
          className="flex-1 accent-[#00ffaa] cursor-pointer h-1"
          aria-label={`Minimum confidence: ${filters.minConfidence}%`}
        />
        <span
          className="text-[11px] font-bold tabular-nums w-10 text-right"
          style={{
            color:
              filters.minConfidence >= 75 ? "#00ffaa" :
              filters.minConfidence >= 55 ? "#ffb300" :
                                            "#ef4444",
          }}
        >
          {filters.minConfidence}%
        </span>
      </div>

      {/* ── Category chips ── */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        {/* All toggle */}
        <button
          onClick={toggleAll}
          className="px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all duration-150"
          style={{
            color:      allSelected ? "#050a18" : "#94a3b8",
            background: allSelected ? "#00ffaa" : "rgba(255,255,255,0.05)",
            border:     `1px solid ${allSelected ? "#00ffaa" : "rgba(255,255,255,0.1)"}`,
          }}
          aria-pressed={allSelected}
        >
          All
        </button>

        {ALL_CATEGORIES.map((cat) => {
          const cfg      = CATEGORY_CONFIG[cat];
          const selected = filters.categories.has(cat);
          return (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all duration-150"
              style={{
                color:      selected ? "#050a18" : cfg.color,
                background: selected ? cfg.color   : cfg.bg,
                border:     `1px solid ${selected ? cfg.color : cfg.border}`,
                opacity:    selected ? 1 : 0.7,
              }}
              aria-pressed={selected}
              aria-label={`Filter by ${cfg.label}`}
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

// ─── Icons ────────────────────────────────────────────────────────────────────

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
