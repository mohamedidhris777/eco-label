/**
 * EcoLabel X — Shared UploadZone Component
 *
 * Reusable drag-and-drop PDF upload zone used by:
 *   Claims, Verify, Greenwashing, Results, Audit pages.
 *
 * Eliminates duplicated UploadZone implementations across modules.
 */
"use client";

import { useRef, useState } from "react";

export interface UploadZoneProps {
  /** Label shown in the centre of the zone */
  label?:       string;
  /** Sub-label / hint text */
  hint?:        string;
  /** Tags displayed below the label (e.g. risk level pills) */
  tags?:        React.ReactNode;
  /** Called when a valid PDF file is selected */
  onFile:       (file: File) => void;
  /** Error message to display instead of default content */
  errorMsg?:    string;
  /** Disable the zone (e.g. while uploading) */
  disabled?:    boolean;
  /** Extra className on the outer div */
  className?:   string;
}

export function UploadZone({
  label     = "Upload a PDF to analyse",
  hint      = "Drag and drop or click to browse · PDF only · Max 50 MB",
  tags,
  onFile,
  errorMsg,
  disabled,
  className = "",
}: UploadZoneProps) {
  const inputRef           = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      /* let parent handle the error */
      onFile(file);
      return;
    }
    onFile(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const onClick = () => {
    if (!disabled) inputRef.current?.click();
  };

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      aria-label={label + ". Click or drag and drop."}
      aria-disabled={disabled}
      className={`relative rounded-2xl p-10 sm:p-14 flex flex-col items-center gap-4 transition-all duration-300 ${
        disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
      } ${className}`}
      style={{
        background: dragging ? "rgba(0,255,170,0.05)" : "rgba(255,255,255,0.02)",
        border: `2px dashed ${
          dragging  ? "rgba(0,255,170,0.5)" :
          errorMsg  ? "rgba(239,68,68,0.4)" :
          "rgba(255,255,255,0.1)"
        }`,
      }}
    >
      <div className="text-5xl select-none" aria-hidden="true">
        {errorMsg ? "⚠️" : dragging ? "📂" : "📄"}
      </div>

      <div className="text-center">
        <p className="text-white font-semibold text-lg">
          {errorMsg ? "Upload failed" : dragging ? "Drop your PDF here" : label}
        </p>
        <p className="text-slate-500 text-sm mt-1">
          {errorMsg ?? hint}
        </p>
      </div>

      {tags && !errorMsg && (
        <div className="flex flex-wrap justify-center gap-2 mt-1 max-w-lg">
          {tags}
        </div>
      )}

      {errorMsg && (
        <button
          onClick={(e) => { e.stopPropagation(); onClick(); }}
          className="px-5 py-2 rounded-xl text-xs font-semibold text-white mt-1"
          style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}
        >
          Try again
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="sr-only"
        aria-label="PDF file input"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        disabled={disabled}
      />
    </div>
  );
}

// ─── Shared uploading progress bar ────────────────────────────────────────────

export interface UploadProgressProps {
  progress:    number;
  label?:      string;
  subLabel?:   string;
  currentStage?: string;
}

const STAGES = [
  "Uploading PDF",
  "Extracting Text",
  "Detecting Claims",
  "Verifying Evidence",
  "Calculating Carbon Score",
  "Greenwashing Analysis",
  "Generating Audit Report",
];

export function UploadProgress({
  progress,
  label    = "Analysing PDF…",
  subLabel,
  currentStage = "Uploading PDF",
}: UploadProgressProps) {
  const activeIdx = STAGES.indexOf(currentStage);

  return (
    <div
      className="rounded-2xl p-8 flex flex-col items-center gap-6"
      style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <div className="text-4xl animate-bounce select-none" aria-hidden="true">⚙️</div>
      <div className="text-center">
        <p className="text-white font-semibold text-base">{label}</p>
        <p className="text-xs text-[#00ffaa] font-mono mt-1">Stage: {currentStage}</p>
      </div>

      {/* Progress Bar */}
      <div
        className="w-full max-w-md h-2.5 rounded-full overflow-hidden"
        style={{ background: "rgba(255,255,255,0.07)" }}
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Analysis progress"
      >
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width:      `${progress}%`,
            background: "linear-gradient(90deg,#00ffaa,#00c8ff)",
            boxShadow:  "0 0 12px rgba(0,255,170,0.5)",
          }}
        />
      </div>

      {/* Animated Stage Steps */}
      <div className="w-full max-w-md grid grid-cols-2 gap-2 text-left pt-2 border-t border-white/5">
        {STAGES.map((stg, i) => {
          const isDone = i < activeIdx;
          const isCurrent = i === activeIdx;
          return (
            <div
              key={stg}
              className={`flex items-center gap-2 text-[11px] transition-colors ${
                isCurrent
                  ? "text-[#00ffaa] font-semibold"
                  : isDone
                  ? "text-slate-400 opacity-80"
                  : "text-slate-600"
              }`}
            >
              <span className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] border border-current">
                {isDone ? "✓" : isCurrent ? "▶" : i + 1}
              </span>
              <span className="truncate">{stg}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Shared Pagination ────────────────────────────────────────────────────────

export function Pagination({
  current,
  total,
  onChange,
}: {
  current:  number;
  total:    number;
  onChange: (p: number) => void;
}) {
  // Show max 7 page buttons; ellipse the rest
  const pages: (number | "…")[] = [];
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    if (current > 3) pages.push("…");
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
    if (current < total - 2) pages.push("…");
    pages.push(total);
  }

  return (
    <nav
      className="flex items-center justify-center gap-2 pb-2"
      aria-label="Pagination"
    >
      <button
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
        className="px-3 py-1.5 rounded-lg text-xs text-slate-400 border border-white/10 disabled:opacity-30 hover:text-white hover:border-white/20 transition-all"
        aria-label="Previous page"
      >
        ← Prev
      </button>

      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`ell-${i}`} className="text-slate-600 text-xs px-1">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            className="w-8 h-8 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: p === current ? "#00ffaa"                   : "rgba(255,255,255,0.04)",
              color:      p === current ? "#050a18"                   : "#64748b",
              border:     `1px solid ${p === current ? "#00ffaa"    : "rgba(255,255,255,0.08)"}`,
            }}
            aria-label={`Page ${p}`}
            aria-current={p === current ? "page" : undefined}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onChange(current + 1)}
        disabled={current === total}
        className="px-3 py-1.5 rounded-lg text-xs text-slate-400 border border-white/10 disabled:opacity-30 hover:text-white hover:border-white/20 transition-all"
        aria-label="Next page"
      >
        Next →
      </button>
    </nav>
  );
}

// ─── Shared SVG icon set ──────────────────────────────────────────────────────

export function UploadIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

export function DownloadIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

export function PrinterIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  );
}
