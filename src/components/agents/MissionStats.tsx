/**
 * EcoLabel X — AI Mission Control: Mission Stats Bar
 *
 * Top-level summary stats strip: overall progress, active agents,
 * total tokens, and elapsed mission time.
 */
"use client";

import { useEffect, useState } from "react";
import type { Agent } from "./types";

interface MissionStatsProps {
  agents:        Agent[];
  totalProgress: number;
  activeCount:   number;
  allComplete:   boolean;
  onReset:       () => void;
}

function MissionTimer({ running }: { running: boolean }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  const h   = Math.floor(elapsed / 3600);
  const m   = Math.floor((elapsed % 3600) / 60);
  const s   = elapsed % 60;
  const fmt = [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");

  return (
    <span className="font-mono font-bold text-white tabular-nums">{fmt}</span>
  );
}

export function MissionStats({
  agents,
  totalProgress,
  activeCount,
  allComplete,
  onReset,
}: MissionStatsProps) {
  const totalTokens   = agents.reduce((s, a) => s + a.tokensUsed, 0);
  const completedCount = agents.filter((a) => a.status === "complete").length;
  const errorCount    = agents.filter((a) => a.status === "error").length;
  const missionRunning = activeCount > 0;

  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <div className="flex flex-wrap items-center gap-4 sm:gap-8">
        {/* Overall progress */}
        <div className="flex items-center gap-3 flex-1 min-w-[180px]">
          <div className="flex-1">
            <div className="flex justify-between text-[10px] mb-1.5">
              <span className="text-slate-500 uppercase tracking-wider">Overall progress</span>
              <span className="font-bold text-[#00ffaa] tabular-nums">{totalProgress}%</span>
            </div>
            <div
              className="h-2 rounded-full overflow-hidden"
              style={{ background: "rgba(255,255,255,0.06)" }}
              role="progressbar"
              aria-valuenow={totalProgress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Overall mission progress"
            >
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width:      `${totalProgress}%`,
                  background: allComplete
                    ? "linear-gradient(90deg,#00ffaa,#00c8ff)"
                    : "linear-gradient(90deg,#00ffaa,#9b59ff)",
                  boxShadow: "0 0 10px rgba(0,255,170,0.4)",
                }}
              />
            </div>
          </div>
        </div>

        {/* Stat pills */}
        <div className="flex flex-wrap gap-4">
          {[
            { label: "Elapsed",         value: <MissionTimer running={missionRunning} />, },
            { label: "Active agents",   value: <span className="font-mono font-bold text-[#00c8ff]">{activeCount}</span>     },
            { label: "Complete",        value: <span className="font-mono font-bold text-[#00ffaa]">{completedCount}/5</span> },
            { label: "Total tokens",    value: <span className="font-mono font-bold text-[#9b59ff]">{totalTokens.toLocaleString()}</span> },
            ...(errorCount > 0 ? [{ label: "Errors", value: <span className="font-mono font-bold text-red-400">{errorCount}</span> }] : []),
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col">
              <span className="text-[9px] uppercase tracking-widest text-slate-600">{label}</span>
              <span className="text-sm mt-0.5">{value}</span>
            </div>
          ))}
        </div>

        {/* Reset button */}
        <button
          onClick={onReset}
          className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 border border-[rgba(255,255,255,0.1)] hover:text-white hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.04)] transition-all duration-200"
          aria-label="Reset mission simulation"
        >
          <ResetIcon />
          Reset
        </button>
      </div>

      {/* Mission complete banner */}
      {allComplete && (
        <div
          className="mt-4 flex items-center gap-3 px-4 py-3 rounded-xl animate-slide-up"
          style={{ background: "rgba(0,255,170,0.07)", border: "1px solid rgba(0,255,170,0.2)" }}
          role="status"
          aria-live="polite"
        >
          <span className="text-xl" aria-hidden="true">🎉</span>
          <div>
            <p className="text-sm font-bold text-[#00ffaa]">Mission Complete</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              All 5 agents finished successfully. Audit report is ready to download.
            </p>
          </div>
          <button
            className="ml-auto px-4 py-2 rounded-xl text-xs font-semibold text-[#050a18] bg-gradient-to-r from-[#00ffaa] to-[#00c8ff] hover:opacity-90 transition-opacity"
            aria-label="Download audit report"
          >
            Download Report
          </button>
        </div>
      )}
    </div>
  );
}

function ResetIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 .49-3" />
    </svg>
  );
}
