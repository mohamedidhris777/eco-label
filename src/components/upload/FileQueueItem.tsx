/**
 * EcoLabel X — Upload Module: File Queue Item
 *
 * A single file row inside the upload queue, showing:
 *  - File type icon + name + size
 *  - Upload stage label (Queued → Validating → Uploading → Done / Error)
 *  - Linear progress bar (animated)
 *  - Cancel button (while uploading)
 *  - Retry button (on error)
 *  - Error message chip
 */
"use client";

import { cn } from "@/lib/utils/cn";
import { FileTypeIcon, fileTypeColor } from "./FileTypeIcon";
import type { UploadFile, FileStatus } from "./types";

// ─── Stage config ─────────────────────────────────────────────────────────────

const STAGE_CONFIG: Record<FileStatus, { label: string; color: string }> = {
  queued:     { label: "Queued",     color: "#64748b" },
  validating: { label: "Validating", color: "#ffb300" },
  uploading:  { label: "Uploading",  color: "#00c8ff" },
  success:    { label: "Complete",   color: "#00ffaa" },
  error:      { label: "Failed",     color: "#ef4444" },
};

// ─── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({
  pct,
  status,
  color,
}: {
  pct:    number;
  status: FileStatus;
  color:  string;
}) {
  if (status === "queued") return null;

  return (
    <div
      className="h-1 rounded-full overflow-hidden"
      style={{ background: "rgba(255,255,255,0.06)" }}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full transition-all duration-300"
        style={{
          width:     `${pct}%`,
          background:
            status === "success"
              ? `linear-gradient(90deg, #00ffaa, #00c8ff)`
              : status === "error"
              ? "#ef4444"
              : `linear-gradient(90deg, ${color}, ${color}88)`,
          boxShadow:
            status !== "error"
              ? `0 0 8px ${color}50`
              : "none",
        }}
      />
    </div>
  );
}

// ─── Stage badge ──────────────────────────────────────────────────────────────

function StageBadge({ status }: { status: FileStatus }) {
  const cfg = STAGE_CONFIG[status];
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0"
      style={{ color: cfg.color, background: `${cfg.color}14` }}
    >
      {status === "uploading" && (
        <span
          className="w-1.5 h-1.5 rounded-full animate-beacon flex-shrink-0"
          style={{ background: cfg.color }}
          aria-hidden="true"
        />
      )}
      {status === "validating" && (
        <span
          className="w-1.5 h-1.5 rounded-full animate-pulse flex-shrink-0"
          style={{ background: cfg.color }}
          aria-hidden="true"
        />
      )}
      {cfg.label}
    </span>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface FileQueueItemProps {
  item:     UploadFile;
  onCancel: (id: string) => void;
  onRetry:  (id: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function FileQueueItem({ item, onCancel, onRetry }: FileQueueItemProps) {
  const accent     = fileTypeColor(item.type);
  const stage      = STAGE_CONFIG[item.status];
  const isDone     = item.status === "success";
  const isError    = item.status === "error";
  const isActive   = item.status === "uploading" || item.status === "validating";
  const isQueued   = item.status === "queued";

  return (
    <li
      className={cn(
        "group flex flex-col gap-2.5 p-4 rounded-xl transition-all duration-200",
        isDone   && "opacity-80",
      )}
      style={{
        background: isError
          ? "rgba(239,68,68,0.05)"
          : "rgba(255,255,255,0.03)",
        border: isError
          ? "1px solid rgba(239,68,68,0.2)"
          : isDone
          ? "1px solid rgba(0,255,170,0.12)"
          : "1px solid rgba(255,255,255,0.07)",
      }}
      aria-label={`${item.file.name} — ${stage.label}`}
    >
      {/* ── Top row: icon + meta + badge + action ── */}
      <div className="flex items-center gap-3">
        {/* File type icon */}
        <FileTypeIcon type={item.type} size="md" />

        {/* Name + size */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate leading-tight">
            {item.file.name}
          </p>
          <p className="text-[10px] text-slate-600 mt-0.5">
            {item.sizeLabel} · {item.type.toUpperCase()}
          </p>
        </div>

        {/* Stage badge */}
        <StageBadge status={item.status} />

        {/* Progress pct (active only) */}
        {isActive && (
          <span className="text-xs font-bold tabular-nums" style={{ color: accent, minWidth: 36, textAlign: "right" }}>
            {Math.round(item.progress)}%
          </span>
        )}

        {/* Success check */}
        {isDone && (
          <svg className="w-4 h-4 flex-shrink-0 text-[#00ffaa]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}

        {/* Cancel button */}
        {(isActive || isQueued) && (
          <button
            onClick={() => onCancel(item.id)}
            className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-lg flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-[rgba(239,68,68,0.1)] transition-all duration-200 flex-shrink-0"
            aria-label={`Cancel upload of ${item.file.name}`}
          >
            <XIcon />
          </button>
        )}

        {/* Retry button */}
        {isError && (
          <button
            onClick={() => onRetry(item.id)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium text-[#00c8ff] hover:bg-[rgba(0,200,255,0.1)] transition-all duration-200 flex-shrink-0"
            aria-label={`Retry upload of ${item.file.name}`}
          >
            <RetryIcon />
            Retry
          </button>
        )}
      </div>

      {/* ── Progress bar ── */}
      <ProgressBar
        pct={item.progress}
        status={item.status}
        color={accent}
      />

      {/* ── Error message ── */}
      {isError && item.error && (
        <p
          className="text-[11px] text-red-400 px-1"
          role="alert"
          aria-live="polite"
        >
          ⚠ {item.error}
        </p>
      )}
    </li>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function XIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6"  y1="6" x2="18" y2="18" />
    </svg>
  );
}

function RetryIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 .49-3" />
    </svg>
  );
}
