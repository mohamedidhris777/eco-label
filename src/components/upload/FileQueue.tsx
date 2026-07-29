/**
 * EcoLabel X — Upload Module: File Queue
 *
 * Manages the upload queue with useReducer. Simulates a three-stage
 * upload pipeline per file: queued → validating → uploading → success/error.
 *
 * Exposes:
 *  - <FileQueue onFiles={files} />  — renders the full queue panel
 *  - Handles concurrent uploads (max 3 at once)
 *  - Cancel, retry, and clear-completed actions
 */
"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import { cn } from "@/lib/utils/cn";
import { FileQueueItem } from "./FileQueueItem";
import type { UploadFile, QueueAction, FileStatus } from "./types";

// ─── Reducer ──────────────────────────────────────────────────────────────────

function queueReducer(state: UploadFile[], action: QueueAction): UploadFile[] {
  switch (action.type) {
    case "ADD":
      return [...state, ...action.files];

    case "PROGRESS":
      return state.map((f) =>
        f.id === action.id ? { ...f, progress: action.progress } : f
      );

    case "STATUS":
      return state.map((f) =>
        f.id === action.id
          ? { ...f, status: action.status, error: action.error }
          : f
      );

    case "CANCEL":
      return state.filter((f) => f.id !== action.id);

    case "RETRY":
      return state.map((f) =>
        f.id === action.id
          ? { ...f, status: "queued", progress: 0, error: undefined }
          : f
      );

    case "CLEAR_DONE":
      return state.filter((f) => f.status !== "success");

    default:
      return state;
  }
}

// ─── Simulated upload pipeline ────────────────────────────────────────────────

/** Runs a fake 3-stage upload for one file, updating state via dispatch. */
function simulateUpload(
  id:       string,
  dispatch: React.Dispatch<QueueAction>,
  abortMap: React.MutableRefObject<Map<string, boolean>>
): void {
  // Helper: check if cancelled
  const isCancelled = () => abortMap.current.get(id) === true;

  const setStatus = (status: FileStatus, error?: string) => {
    if (!isCancelled()) dispatch({ type: "STATUS", id, status, error });
  };
  const setProgress = (progress: number) => {
    if (!isCancelled()) dispatch({ type: "PROGRESS", id, progress });
  };

  // Stage 1: Validating (0–15%) — 400–800 ms
  setStatus("validating");

  const validateDuration = 400 + Math.random() * 400;
  let elapsed = 0;
  const validateTick = 80;
  const validateInterval = setInterval(() => {
    if (isCancelled()) { clearInterval(validateInterval); return; }
    elapsed += validateTick;
    setProgress(Math.min((elapsed / validateDuration) * 15, 15));
    if (elapsed >= validateDuration) {
      clearInterval(validateInterval);

      // 8% chance of validation error
      if (Math.random() < 0.08) {
        setStatus("error", "File validation failed — unsupported schema structure.");
        return;
      }

      // Stage 2: Uploading (15–100%) — variable speed
      setStatus("uploading");
      let p = 15;
      const uploadInterval = setInterval(() => {
        if (isCancelled()) { clearInterval(uploadInterval); return; }

        // Simulate speed variation: fast start, slows near end
        const remaining = 100 - p;
        const increment = (Math.random() * 12 + 3) * (remaining / 85);
        p = Math.min(p + increment, 99.5);
        setProgress(p);

        if (p >= 99.5) {
          clearInterval(uploadInterval);
          setProgress(100);

          // 5% chance of upload error
          if (Math.random() < 0.05) {
            setStatus("error", "Network error — connection dropped at 99%. Try again.");
            return;
          }

          setTimeout(() => setStatus("success"), 250);
        }
      }, 120);
    }
  }, validateTick);
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface FileQueueProps {
  incoming: UploadFile[];      // New files from DropZone
  onIncomingConsumed: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

const MAX_CONCURRENT = 3;

export function FileQueue({ incoming, onIncomingConsumed }: FileQueueProps) {
  const [queue, dispatch]  = useReducer(queueReducer, [] as UploadFile[]);
  const abortMap           = useRef<Map<string, boolean>>(new Map());
  const processingRef      = useRef<Set<string>>(new Set());

  // ── Consume incoming files from DropZone ────────────────────────────────────
  useEffect(() => {
    if (incoming.length === 0) return;
    dispatch({ type: "ADD", files: incoming });
    onIncomingConsumed();
  }, [incoming, onIncomingConsumed]);

  // ── Auto-start uploads when queued slots are free ──────────────────────────
  useEffect(() => {
    const activeCount = queue.filter(
      (f) => f.status === "uploading" || f.status === "validating"
    ).length;

    const available = MAX_CONCURRENT - activeCount;
    if (available <= 0) return;

    const toStart = queue
      .filter((f) => f.status === "queued")
      .slice(0, available);

    toStart.forEach((f) => {
      if (processingRef.current.has(f.id)) return;
      processingRef.current.add(f.id);
      abortMap.current.set(f.id, false);
      simulateUpload(f.id, dispatch, abortMap);
    });
  }, [queue]);

  // ── Actions ─────────────────────────────────────────────────────────────────
  const handleCancel = useCallback((id: string) => {
    abortMap.current.set(id, true);
    processingRef.current.delete(id);
    dispatch({ type: "CANCEL", id });
  }, []);

  const handleRetry = useCallback((id: string) => {
    abortMap.current.set(id, false);
    processingRef.current.delete(id);
    dispatch({ type: "RETRY", id });
  }, []);

  const handleClearDone = useCallback(() => {
    dispatch({ type: "CLEAR_DONE" });
  }, []);

  // ─── Empty state ────────────────────────────────────────────────────────────
  if (queue.length === 0) return null;

  // ─── Stats ──────────────────────────────────────────────────────────────────
  const done    = queue.filter((f) => f.status === "success").length;
  const errors  = queue.filter((f) => f.status === "error").length;
  const active  = queue.filter((f) => f.status === "uploading" || f.status === "validating").length;
  const queued  = queue.filter((f) => f.status === "queued").length;

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b border-[rgba(255,255,255,0.07)]"
        style={{ background: "rgba(255,255,255,0.02)" }}
      >
        <div className="flex items-center gap-3">
          <h2 className="font-display font-semibold text-white text-sm">
            Upload Queue
          </h2>
          {/* Mini stat pills */}
          <div className="flex gap-1.5">
            {active > 0 && (
              <Pill color="#00c8ff" label={`${active} uploading`} pulse />
            )}
            {queued > 0 && (
              <Pill color="#64748b" label={`${queued} queued`} />
            )}
            {done > 0 && (
              <Pill color="#00ffaa" label={`${done} done`} />
            )}
            {errors > 0 && (
              <Pill color="#ef4444" label={`${errors} failed`} />
            )}
          </div>
        </div>

        {done > 0 && (
          <button
            onClick={handleClearDone}
            className="text-[11px] text-slate-500 hover:text-[#00ffaa] transition-colors"
            aria-label="Remove completed uploads from list"
          >
            Clear done
          </button>
        )}
      </div>

      {/* File list */}
      <ul
        className="divide-y divide-[rgba(255,255,255,0.04)] max-h-[480px] overflow-y-auto"
        aria-label="Upload queue"
      >
        {queue.map((item) => (
          <FileQueueItem
            key={item.id}
            item={item}
            onCancel={handleCancel}
            onRetry={handleRetry}
          />
        ))}
      </ul>

      {/* Overall progress footer (shown while any active) */}
      {active > 0 && (
        <div
          className="px-4 py-2.5 border-t border-[rgba(255,255,255,0.07)] flex items-center justify-between"
          style={{ background: "rgba(255,255,255,0.015)" }}
        >
          <p className="text-[11px] text-slate-500">
            Processing {active} file{active > 1 ? "s" : ""}…
          </p>
          {/* Overall bar */}
          <div className="flex-1 mx-4 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(done / queue.length) * 100}%`,
                background: "linear-gradient(90deg, #00ffaa, #00c8ff)",
                boxShadow:  "0 0 8px rgba(0,255,170,0.4)",
              }}
            />
          </div>
          <p className="text-[11px] text-[#00ffaa] font-medium tabular-nums">
            {done}/{queue.length}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Pill ─────────────────────────────────────────────────────────────────────

function Pill({ color, label, pulse }: { color: string; label: string; pulse?: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full"
      style={{ color, background: `${color}14` }}
    >
      <span
        className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", pulse && "animate-beacon")}
        style={{ background: color }}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}
