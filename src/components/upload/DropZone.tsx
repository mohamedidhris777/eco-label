/**
 * EcoLabel X — Upload Module: Drop Zone
 *
 * Full-width drag-and-drop surface with:
 *  - Active drag highlight with border pulse animation
 *  - File type filter tabs (All | PDF | CSV | Excel | Image)
 *  - Multi-file selection via OS picker
 *  - Accessible keyboard interaction
 */
"use client";

import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";
import {
  ACCEPTED_EXTENSIONS,
  AcceptedFileType,
  validateFile,
  resolveFileType,
  formatBytes,
  UploadFile,
} from "./types";

// ─── Format filter tabs ───────────────────────────────────────────────────────

type FilterTab = "all" | AcceptedFileType;

const TABS: { id: FilterTab; label: string; accept: string; ext: string }[] = [
  { id: "all",   label: "All Files", accept: ACCEPTED_EXTENSIONS,  ext: "Any"   },
  { id: "pdf",   label: "PDF",       accept: ".pdf",               ext: ".pdf"  },
  { id: "csv",   label: "CSV",       accept: ".csv",               ext: ".csv"  },
  { id: "excel", label: "Excel",     accept: ".xlsx,.xls",         ext: ".xlsx" },
  { id: "image", label: "Image",     accept: ".png,.jpg,.jpeg,.webp,.gif,.svg", ext: ".png…" },
];

const FORMAT_GUIDES = [
  { ext: ".pdf",  label: "PDF",   color: "#ef4444", hint: "Sustainability reports, certifications" },
  { ext: ".csv",  label: "CSV",   color: "#00ffaa", hint: "Product catalog bulk imports"           },
  { ext: ".xlsx", label: "Excel", color: "#22c55e", hint: "Multi-sheet product data"              },
  { ext: ".png",  label: "Image", color: "#9b59ff", hint: "Product photos, label scans"           },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface DropZoneProps {
  onFiles: (files: UploadFile[]) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DropZone({ onFiles }: DropZoneProps) {
  const [dragging,    setDragging]    = useState(false);
  const [activeTab,   setActiveTab]   = useState<FilterTab>("all");
  const [dragError,   setDragError]   = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentAccept =
    TABS.find((t) => t.id === activeTab)?.accept ?? ACCEPTED_EXTENSIONS;

  // ── Build UploadFile[] from FileList ────────────────────────────────────────

  const buildQueue = useCallback((raw: FileList): UploadFile[] => {
    const results: UploadFile[] = [];
    const errors: string[]      = [];

    Array.from(raw).forEach((file) => {
      const err = validateFile(file);
      if (err) {
        errors.push(`${file.name}: ${err}`);
        return;
      }
      results.push({
        id:        crypto.randomUUID(),
        file,
        type:      resolveFileType(file),
        status:    "queued",
        progress:  0,
        sizeLabel: formatBytes(file.size),
        addedAt:   Date.now(),
      });
    });

    if (errors.length > 0) {
      setDragError(errors.join(" · "));
      setTimeout(() => setDragError(null), 6000);
    }
    return results;
  }, []);

  // ── Drag handlers ───────────────────────────────────────────────────────────

  const onDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  }, []);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only clear if leaving the zone itself (not a child)
    if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) {
      setDragging(false);
    }
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragging(false);
      const files = buildQueue(e.dataTransfer.files);
      if (files.length > 0) onFiles(files);
    },
    [buildQueue, onFiles]
  );

  // ── File input change ───────────────────────────────────────────────────────

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files) return;
      const files = buildQueue(e.target.files);
      if (files.length > 0) onFiles(files);
      // Reset so the same file can be re-selected after clearing
      e.target.value = "";
    },
    [buildQueue, onFiles]
  );

  const openPicker = () => inputRef.current?.click();

  return (
    <div className="space-y-4">
      {/* ── Format filter tabs ──────────────────────────────────────────────── */}
      <div
        className="flex items-center gap-1 p-1 rounded-xl w-fit"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
        role="tablist"
        aria-label="Filter by file type"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap",
              activeTab === tab.id
                ? "bg-[rgba(0,255,170,0.12)] text-[#00ffaa] border border-[rgba(0,255,170,0.25)]"
                : "text-slate-500 hover:text-white hover:bg-[rgba(255,255,255,0.05)]"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Drop zone surface ───────────────────────────────────────────────── */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Drop files here or press Enter to open file picker"
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={openPicker}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openPicker();
          }
        }}
        className={cn(
          "relative rounded-2xl cursor-pointer overflow-hidden",
          "border-2 border-dashed",
          "transition-all duration-300",
          "flex flex-col items-center justify-center gap-6 py-16 px-8",
          dragging
            ? "border-[rgba(0,255,170,0.7)] bg-[rgba(0,255,170,0.05)] scale-[1.005]"
            : "border-[rgba(255,255,255,0.1)] hover:border-[rgba(0,255,170,0.4)] hover:bg-[rgba(0,255,170,0.02)]"
        )}
        style={{ minHeight: 260 }}
      >
        {/* Animated background glow when dragging */}
        {dragging && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(0,255,170,0.06) 0%, transparent 70%)",
            }}
            aria-hidden="true"
          />
        )}

        {/* Icon */}
        <div
          className={cn(
            "w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300",
            dragging ? "scale-110" : ""
          )}
          style={{
            background: dragging ? "rgba(0,255,170,0.12)" : "rgba(255,255,255,0.04)",
            border:     dragging ? "1px solid rgba(0,255,170,0.35)" : "1px solid rgba(255,255,255,0.08)",
            color:      dragging ? "#00ffaa" : "#64748b",
          }}
          aria-hidden="true"
        >
          <UploadCloudIcon dragging={dragging} />
        </div>

        {/* Copy */}
        <div className="text-center space-y-2 relative z-10">
          <p className="text-base font-semibold text-white">
            {dragging ? "Release to add files" : (
              <>
                <span className="text-[#00ffaa]">Click to browse</span>
                {" or drag & drop"}
              </>
            )}
          </p>
          <p className="text-sm text-slate-500">
            {activeTab === "all"
              ? "PDF, CSV, Excel (.xlsx), PNG, JPG, WebP"
              : `${TABS.find((t) => t.id === activeTab)?.label} files only`}
          </p>
          <p className="text-xs text-slate-600">
            Multiple files · Max 50 MB each
          </p>
        </div>

        {/* Format guide pills */}
        {activeTab === "all" && (
          <div className="flex gap-2 flex-wrap justify-center relative z-10">
            {FORMAT_GUIDES.map(({ ext, label, color, hint }) => (
              <div
                key={ext}
                className="group relative flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium cursor-default"
                style={{
                  background: `${color}0d`,
                  border:     `1px solid ${color}28`,
                  color,
                }}
                title={hint}
              >
                <span className="w-1 h-1 rounded-full" style={{ background: color }} aria-hidden="true" />
                {ext}
                <span className="sr-only">({label} — {hint})</span>
              </div>
            ))}
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={currentAccept}
          onChange={onInputChange}
          className="sr-only"
          aria-hidden="true"
          tabIndex={-1}
        />
      </div>

      {/* Error toast */}
      {dragError && (
        <div
          className="flex items-start gap-3 px-4 py-3 rounded-xl text-xs text-red-400 animate-slide-up"
          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}
          role="alert"
          aria-live="polite"
        >
          <ErrorIcon />
          <span>{dragError}</span>
        </div>
      )}
    </div>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function UploadCloudIcon({ dragging }: { dragging: boolean }) {
  return (
    <svg
      className={cn("w-9 h-9 transition-transform duration-300", dragging && "-translate-y-1")}
      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
    >
      <polyline points="16 16 12 12 8 16" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
