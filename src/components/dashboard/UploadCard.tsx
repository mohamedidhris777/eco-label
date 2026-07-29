/**
 * EcoLabel X — Upload Card
 *
 * Drag-and-drop product PDF file upload card for the overview page.
 * Connected to centralized AppContext.
 */
"use client";

import { useCallback, useRef, useState } from "react";
import { useApp } from "@/context/AppContext";

function ProgressRing({ pct }: { pct: number }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" className="-rotate-90" aria-hidden="true">
      <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
      <circle
        cx="36" cy="36" r={r}
        fill="none"
        stroke="#00ffaa"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - pct / 100)}
        style={{ filter: "drop-shadow(0 0 6px rgba(0,255,170,0.5))", transition: "stroke-dashoffset 0.4s ease" }}
      />
    </svg>
  );
}

export function UploadCard() {
  const { analyzePDF, isAnalyzing, progress, errorMsg, state: appState } = useApp();
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      analyzePDF(file);
    },
    [analyzePDF]
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  return (
    <div
      className="rounded-2xl p-5 flex flex-col justify-between h-full relative overflow-hidden"
      style={{
        background: dragging ? "rgba(0,255,170,0.06)" : "rgba(255,255,255,0.03)",
        border: `1px solid ${dragging ? "rgba(0,255,170,0.4)" : "rgba(255,255,255,0.08)"}`,
      }}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
    >
      {/* Header */}
      <div>
        <h3 className="font-display font-semibold text-white text-sm">Upload ESG Report</h3>
        <p className="text-[11px] text-slate-500 mt-0.5">Upload a PDF to analyze sustainability claims</p>
      </div>

      {/* State-based body */}
      <div className="my-4 flex flex-col items-center justify-center min-h-[120px] text-center">
        {isAnalyzing ? (
          <div className="flex flex-col items-center gap-2">
            <div className="relative flex items-center justify-center">
              <ProgressRing pct={progress} />
              <span className="absolute font-display font-bold text-xs text-[#00ffaa]">
                {Math.round(progress)}%
              </span>
            </div>
            <p className="text-xs font-medium text-slate-300 mt-1">Analyzing report...</p>
          </div>
        ) : appState.greenwashing ? (
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-10 h-10 rounded-full bg-[rgba(0,255,170,0.1)] border border-[rgba(0,255,170,0.3)] flex items-center justify-center text-[#00ffaa] text-lg">
              ✓
            </div>
            <p className="text-xs font-semibold text-white truncate max-w-[200px]">
              {appState.filename}
            </p>
            <p className="text-[10px] text-slate-500">
              {appState.greenwashing.report.claim_breakdown.total} claims analyzed
            </p>
          </div>
        ) : (
          <div
            onClick={() => inputRef.current?.click()}
            className="w-full h-full border border-dashed border-[rgba(255,255,255,0.12)] hover:border-[rgba(0,255,170,0.3)] rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all bg-[rgba(255,255,255,0.01)]"
          >
            <span className="text-2xl">📄</span>
            <div>
              <p className="text-xs font-semibold text-slate-300">Drop PDF file here</p>
              <p className="text-[10px] text-slate-500">or click to select file</p>
            </div>
          </div>
        )}
      </div>

      {errorMsg && (
        <p className="text-[10px] text-red-400 mb-2 text-center">{errorMsg}</p>
      )}

      {/* Button */}
      <button
        onClick={() => inputRef.current?.click()}
        disabled={isAnalyzing}
        className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-[#050a18] bg-[#00ffaa] hover:bg-[#00e699] disabled:opacity-50 transition-all shadow-[0_0_12px_rgba(0,255,170,0.3)]"
      >
        {isAnalyzing ? "Processing..." : appState.greenwashing ? "Upload Another PDF" : "Browse PDF"}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />
    </div>
  );
}
