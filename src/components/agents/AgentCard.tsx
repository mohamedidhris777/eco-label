/**
 * EcoLabel X — AI Mission Control: Agent Card
 *
 * Full animated card for one AI agent. Features:
 *  - Status badge with beacon/pulse indicators
 *  - Animated scan-line overlay when active
 *  - Animated progress bar
 *  - ConfidenceRing SVG
 *  - Live runtime display (ticked externally via props)
 *  - Key metric stats grid
 *  - Expandable activity log
 *  - Pause / resume control
 */
"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils/cn";
import { ConfidenceRing } from "./ConfidenceRing";
import type { Agent, AgentStatus } from "./types";

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CFG: Record<AgentStatus, {
  label:  string;
  color:  string;
  bg:     string;
  border: string;
  pulse:  boolean;
}> = {
  idle:     { label: "Idle",       color: "#64748b", bg: "rgba(100,116,139,0.1)", border: "rgba(100,116,139,0.2)", pulse: false },
  waiting:  { label: "Waiting",    color: "#94a3b8", bg: "rgba(148,163,184,0.08)", border: "rgba(148,163,184,0.15)", pulse: false },
  active:   { label: "Active",     color: "#00ffaa", bg: "rgba(0,255,170,0.1)",  border: "rgba(0,255,170,0.25)",  pulse: true  },
  paused:   { label: "Paused",     color: "#ffb300", bg: "rgba(255,179,0,0.1)",  border: "rgba(255,179,0,0.2)",   pulse: false },
  complete: { label: "Complete",   color: "#00ffaa", bg: "rgba(0,255,170,0.1)",  border: "rgba(0,255,170,0.2)",   pulse: false },
  error:    { label: "Error",      color: "#ef4444", bg: "rgba(239,68,68,0.1)",  border: "rgba(239,68,68,0.2)",   pulse: false },
};

// ─── Runtime formatter ────────────────────────────────────────────────────────

function fmtRuntime(ms: number): string {
  const s   = Math.floor(ms / 1000);
  const m   = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

// ─── Log level colour ─────────────────────────────────────────────────────────

const LOG_COLOR = {
  info:    "#94a3b8",
  warn:    "#ffb300",
  success: "#00ffaa",
  error:   "#ef4444",
} as const;

// ─── Card component ───────────────────────────────────────────────────────────

interface AgentCardProps {
  agent:        Agent;
  onTogglePause: (id: string) => void;
  onInjectError: (id: string) => void;
  style?:        React.CSSProperties;   // for stagger delay
}

export function AgentCard({
  agent,
  onTogglePause,
  onInjectError,
  style,
}: AgentCardProps) {
  const [logsOpen, setLogsOpen] = useState(false);
  const cfg = STATUS_CFG[agent.status];

  const isActive   = agent.status === "active";
  const isPaused   = agent.status === "paused";
  const isComplete = agent.status === "complete";
  const isWaiting  = agent.status === "waiting";
  const isError    = agent.status === "error";
  const canControl = isActive || isPaused;

  // Progress bar colour
  const barColor =
    isError    ? "#ef4444" :
    isComplete ? "linear-gradient(90deg,#00ffaa,#00c8ff)" :
                 `linear-gradient(90deg,${agent.accent},${agent.accent}88)`;

  const cardBorder = isActive
    ? `1px solid ${agent.accent}40`
    : isError
    ? "1px solid rgba(239,68,68,0.25)"
    : "1px solid rgba(255,255,255,0.08)";

  const cardGlow = isActive
    ? `0 0 32px ${agent.accent}14, 0 0 0 1px ${agent.accent}18`
    : "none";

  const recentLogs = useMemo(() => [...agent.logs].reverse().slice(0, 5), [agent.logs]);

  return (
    <article
      className={cn(
        "relative rounded-2xl overflow-hidden flex flex-col gap-0",
        "transition-all duration-500 animate-slide-up",
        isActive && "animate-card-glow",
      )}
      style={{
        background: isWaiting
          ? "rgba(255,255,255,0.02)"
          : "rgba(255,255,255,0.035)",
        border: cardBorder,
        boxShadow: cardGlow,
        ...style,
      }}
      aria-label={`${agent.name} — ${cfg.label}`}
    >
      {/* ── Scan-line overlay (active only) ─────────────────────────────── */}
      {isActive && (
        <div
          className="absolute left-0 right-0 h-px pointer-events-none z-10 animate-scan-line"
          style={{
            background: `linear-gradient(90deg, transparent, ${agent.accent}80, transparent)`,
          }}
          aria-hidden="true"
        />
      )}

      {/* ── Corner glow ──────────────────────────────────────────────────── */}
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl pointer-events-none opacity-0 transition-opacity duration-700"
        style={{
          background: `${agent.accent}18`,
          transform: "translate(40%, -40%)",
          opacity: isActive ? 1 : 0,
        }}
        aria-hidden="true"
      />

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="relative flex items-start justify-between gap-3 p-5 pb-4">
        {/* Icon + name */}
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 relative"
            style={{
              background: `${agent.accent}15`,
              border: `1px solid ${agent.accent}30`,
            }}
          >
            {agent.icon}
            {/* Orbit ring when active */}
            {isActive && (
              <div
                className="absolute inset-0 rounded-2xl border animate-orbit pointer-events-none"
                style={{ borderColor: `${agent.accent}30`, margin: -5, borderRadius: 18 }}
                aria-hidden="true"
              />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                style={{ color: agent.accent, background: `${agent.accent}18` }}
              >
                #{agent.index}
              </span>
              <h3 className="font-display font-bold text-white text-sm leading-tight">
                {agent.name}
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-snug max-w-[180px]">
              {agent.description}
            </p>
          </div>
        </div>

        {/* Status badge */}
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold flex-shrink-0"
          style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}
        >
          {cfg.pulse ? (
            <span
              className="w-1.5 h-1.5 rounded-full animate-beacon flex-shrink-0"
              style={{ background: cfg.color }}
              aria-hidden="true"
            />
          ) : (
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: cfg.color }}
              aria-hidden="true"
            />
          )}
          {cfg.label}
        </div>
      </div>

      {/* ── Progress bar ─────────────────────────────────────────────────── */}
      <div className="px-5 mb-4">
        <div className="flex justify-between text-[10px] mb-1.5">
          <span className="text-slate-500">
            {isWaiting ? "Queued" : `${agent.tasksDone} / ${agent.tasksTotal} tasks`}
          </span>
          <span className="font-bold tabular-nums" style={{ color: agent.accent }}>
            {Math.round(agent.progress)}%
          </span>
        </div>
        <div
          className="h-1.5 rounded-full overflow-hidden"
          style={{ background: "rgba(255,255,255,0.06)" }}
          role="progressbar"
          aria-valuenow={Math.round(agent.progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${agent.name} progress`}
        >
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width:      `${agent.progress}%`,
              background: barColor,
              boxShadow:  !isError ? `0 0 8px ${agent.accent}50` : "none",
            }}
          />
        </div>
      </div>

      {/* ── Metrics row ──────────────────────────────────────────────────── */}
      <div
        className="mx-5 mb-4 grid grid-cols-3 gap-px rounded-xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.05)" }}
      >
        {[
          { label: "Runtime",    value: fmtRuntime(agent.runtimeMs),           mono: true  },
          { label: "Tokens",     value: agent.tokensUsed.toLocaleString(),      mono: true  },
          { label: "Tasks done", value: `${agent.tasksDone}/${agent.tasksTotal}`, mono: false },
        ].map(({ label, value, mono }) => (
          <div
            key={label}
            className="flex flex-col items-center justify-center py-2.5 px-1"
            style={{ background: "#050a18" }}
          >
            <span
              className={cn("text-sm font-bold leading-tight", mono && "font-mono")}
              style={{ color: agent.accent }}
            >
              {value}
            </span>
            <span className="text-[9px] text-slate-600 mt-0.5 uppercase tracking-wider whitespace-nowrap">
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* ── Confidence ring + controls ───────────────────────────────────── */}
      <div className="flex items-center gap-4 px-5 mb-4">
        <ConfidenceRing value={agent.confidence} color={agent.accent} size={80} stroke={6} />

        <div className="flex-1 space-y-2">
          {/* Pause / resume button */}
          {canControl && (
            <button
              onClick={() => onTogglePause(agent.id)}
              className={cn(
                "w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold",
                "border transition-all duration-200",
                isPaused
                  ? "text-[#00ffaa] border-[rgba(0,255,170,0.3)] hover:bg-[rgba(0,255,170,0.08)]"
                  : "text-slate-400 border-[rgba(255,255,255,0.1)] hover:text-white hover:border-[rgba(255,255,255,0.2)]"
              )}
              aria-label={isPaused ? `Resume ${agent.name}` : `Pause ${agent.name}`}
            >
              {isPaused ? <PlayIcon /> : <PauseIcon />}
              {isPaused ? "Resume" : "Pause"}
            </button>
          )}

          {/* Inject error (demo) */}
          {isActive && (
            <button
              onClick={() => onInjectError(agent.id)}
              className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-xl text-[11px] text-red-500 border border-[rgba(239,68,68,0.2)] hover:bg-[rgba(239,68,68,0.06)] transition-all duration-200"
              aria-label={`Inject error into ${agent.name} (demo)`}
              title="Inject error — for demo purposes"
            >
              <ErrorIcon />
              Inject Error
            </button>
          )}

          {/* Retry on error */}
          {isError && (
            <button
              onClick={() => onTogglePause(agent.id)}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold text-[#00c8ff] border border-[rgba(0,200,255,0.3)] hover:bg-[rgba(0,200,255,0.08)] transition-all"
            >
              <RetryIcon />
              Retry
            </button>
          )}

          {/* Complete badge */}
          {isComplete && (
            <div
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold text-[#00ffaa]"
              style={{ background: "rgba(0,255,170,0.06)", border: "1px solid rgba(0,255,170,0.2)" }}
            >
              <CheckIcon />
              Complete
            </div>
          )}
        </div>
      </div>

      {/* ── Activity log toggle ───────────────────────────────────────────── */}
      <div className="border-t border-[rgba(255,255,255,0.06)]">
        <button
          onClick={() => setLogsOpen((v) => !v)}
          className="w-full flex items-center justify-between px-5 py-3 text-[11px] text-slate-500 hover:text-white transition-colors"
          aria-expanded={logsOpen}
          aria-controls={`logs-${agent.id}`}
        >
          <span className="flex items-center gap-2">
            <TerminalIcon />
            Activity log
            <span
              className="px-1.5 py-0.5 rounded-full text-[10px] font-medium"
              style={{ background: "rgba(255,255,255,0.07)", color: "#94a3b8" }}
            >
              {agent.logs.length}
            </span>
          </span>
          <ChevronIcon open={logsOpen} />
        </button>

        {logsOpen && (
          <div
            id={`logs-${agent.id}`}
            className="px-4 pb-4 space-y-1 max-h-40 overflow-y-auto"
            aria-live="polite"
          >
            {recentLogs.map((log, i) => (
              <div
                key={i}
                className="flex items-start gap-2 text-[10px] font-mono py-0.5"
              >
                <span className="text-slate-700 flex-shrink-0 mt-0.5">{log.time}</span>
                <span style={{ color: LOG_COLOR[log.level] }} className="leading-snug">
                  {log.message}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function PauseIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="4" width="4" height="16" rx="1" />
      <rect x="14" y="4" width="4" height="16" rx="1" />
    </svg>
  );
}
function PlayIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5,3 19,12 5,21" />
    </svg>
  );
}
function ErrorIcon() {
  return (
    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
function RetryIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-3" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function TerminalIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  );
}
function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className="w-3.5 h-3.5 transition-transform duration-200"
      style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
