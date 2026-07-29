/**
 * EcoLabel X — AI Agent Status Cards
 *
 * Four cards showing live agent status: Verification, Carbon, Compliance, Greenwashing.
 * Animated pulse dots, progress bars, and live activity feeds.
 */
"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";

// ─── Types ────────────────────────────────────────────────────────────────────

type AgentStatus = "active" | "idle" | "processing" | "error";

interface Agent {
  id:          string;
  name:        string;
  description: string;
  status:      AgentStatus;
  accent:      string;
  icon:        React.ReactNode;
  tasksToday:  number;
  avgTime:     string;
  activity:    string;
  progress?:   number; // 0-100, shown when processing
}

// ─── Mock Agents ──────────────────────────────────────────────────────────────

const AGENTS: Agent[] = [
  {
    id:          "verification",
    name:        "Verification Agent",
    description: "Cross-references 400+ certification databases",
    status:      "active",
    accent:      "#00ffaa",
    icon:        <ShieldCheckIcon />,
    tasksToday:  147,
    avgTime:     "2.3s",
    activity:    "Verifying EU Organic #EO-2024-8821…",
  },
  {
    id:          "carbon",
    name:        "Carbon Agent",
    description: "Scope 1, 2 & 3 lifecycle analysis engine",
    status:      "processing",
    accent:      "#00c8ff",
    icon:        <LeafIcon />,
    tasksToday:  83,
    avgTime:     "4.8s",
    activity:    "Calculating scope 3 for SKU #4092…",
    progress:    67,
  },
  {
    id:          "compliance",
    name:        "Compliance Agent",
    description: "EU ESPR & FTC Green Guide monitoring",
    status:      "active",
    accent:      "#9b59ff",
    icon:        <ScaleIcon />,
    tasksToday:  29,
    avgTime:     "1.1s",
    activity:    "Scanning ESPR updates — all clear",
  },
  {
    id:          "greenwashing",
    name:        "Risk Agent",
    description: "Detects misleading sustainability claims",
    status:      "idle",
    accent:      "#ffb300",
    icon:        <AlertIcon />,
    tasksToday:  12,
    avgTime:     "3.7s",
    activity:    "Standby — 0 flags in queue",
  },
];

// ─── Status Config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<AgentStatus, { label: string; color: string; bg: string; pulse: boolean }> = {
  active:     { label: "Active",     color: "#00ffaa", bg: "rgba(0,255,170,0.12)",  pulse: true  },
  processing: { label: "Processing", color: "#00c8ff", bg: "rgba(0,200,255,0.12)",  pulse: true  },
  idle:       { label: "Idle",       color: "#64748b", bg: "rgba(100,116,139,0.12)", pulse: false },
  error:      { label: "Error",      color: "#ef4444", bg: "rgba(239,68,68,0.12)",  pulse: false },
};

// ─── Animated Activity Text ───────────────────────────────────────────────────

function ActivityFeed({ text, accent }: { text: string; accent: string }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => setVisible(true), 300);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <p
      className="text-[11px] font-mono truncate transition-opacity duration-300"
      style={{ color: `${accent}99`, opacity: visible ? 1 : 0 }}
    >
      <span style={{ color: accent }} aria-hidden="true">› </span>
      {text}
    </p>
  );
}

// ─── Agent Card ───────────────────────────────────────────────────────────────

function AgentCard({ agent }: { agent: Agent }) {
  const cfg = STATUS_CONFIG[agent.status];

  return (
    <div
      className="relative rounded-2xl p-5 overflow-hidden group hover:-translate-y-0.5 transition-all duration-200"
      style={{
        background: "rgba(255,255,255,0.03)",
        border:     `1px solid rgba(255,255,255,0.08)`,
      }}
    >
      {/* Corner glow */}
      <div
        className="absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `${agent.accent}14`, transform: "translate(40%, -40%)" }}
        aria-hidden="true"
      />

      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${agent.accent}15`, border: `1px solid ${agent.accent}30`, color: agent.accent }}
          >
            {agent.icon}
          </div>
          <div>
            <p className="text-sm font-semibold text-white leading-tight">{agent.name}</p>
            <p className="text-[10px] text-slate-600 mt-0.5">{agent.description}</p>
          </div>
        </div>

        {/* Status badge */}
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full flex-shrink-0 text-[10px] font-semibold"
          style={{ color: cfg.color, background: cfg.bg }}
        >
          {cfg.pulse ? (
            <span
              className="w-1.5 h-1.5 rounded-full animate-beacon flex-shrink-0"
              style={{ background: cfg.color }}
            />
          ) : (
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cfg.color }} />
          )}
          {cfg.label}
        </div>
      </div>

      {/* Progress bar (processing only) */}
      {agent.status === "processing" && agent.progress !== undefined && (
        <div className="mb-3">
          <div className="flex justify-between text-[10px] text-slate-600 mb-1">
            <span>Progress</span>
            <span style={{ color: agent.accent }}>{agent.progress}%</span>
          </div>
          <div className="h-1 rounded-full bg-[rgba(255,255,255,0.06)]">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width:      `${agent.progress}%`,
                background: `linear-gradient(90deg, ${agent.accent}, ${agent.accent}88)`,
                boxShadow:  `0 0 8px ${agent.accent}60`,
              }}
            />
          </div>
        </div>
      )}

      {/* Metrics row */}
      <div className="flex gap-4 mb-3">
        <div>
          <p className="text-[10px] text-slate-600">Tasks today</p>
          <p className="text-sm font-bold" style={{ color: agent.accent }}>{agent.tasksToday}</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-600">Avg. time</p>
          <p className="text-sm font-bold text-white">{agent.avgTime}</p>
        </div>
      </div>

      {/* Live activity */}
      <div
        className="rounded-lg px-3 py-2"
        style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.05)" }}
      >
        <ActivityFeed text={agent.activity} accent={agent.accent} />
      </div>
    </div>
  );
}

import { useApp } from "@/context/AppContext";

export function AIAgentStatusCards() {
  const { isAnalyzing, progress, currentStage, state: appState } = useApp();

  const agents: Agent[] = [
    {
      id:          "verification",
      name:        "Verification Agent",
      description: "Cross-references 400+ certification databases",
      status:      isAnalyzing ? "processing" : "active",
      accent:      "#00ffaa",
      icon:        <ShieldCheckIcon />,
      tasksToday:  appState.verification?.summary.total_claims ?? 147,
      avgTime:     "2.3s",
      activity:    isAnalyzing ? `Pipeline: ${currentStage}` : appState.filename ? `Verified ${appState.filename}` : "Monitoring active disclosures…",
      progress:    isAnalyzing ? progress : undefined,
    },
    {
      id:          "carbon",
      name:        "Carbon Agent",
      description: "Scope 1, 2 & 3 lifecycle analysis engine",
      status:      "active",
      accent:      "#00c8ff",
      icon:        <LeafIcon />,
      tasksToday:  appState.greenwashing?.report.claim_breakdown.total ?? 83,
      avgTime:     "1.8s",
      activity:    appState.filename ? `Carbon metrics evaluated for ${appState.filename}` : "Lifecycle baseline calculated",
    },
    {
      id:          "compliance",
      name:        "Compliance Agent",
      description: "EU ESPR & FTC Green Guide monitoring",
      status:      "active",
      accent:      "#9b59ff",
      icon:        <ScaleIcon />,
      tasksToday:  192,
      avgTime:     "1.1s",
      activity:    "Audit taxonomy active",
    },
    {
      id:          "greenwashing",
      name:        "Greenwashing Risk Agent",
      description: "Detects vague language & unsubstantiated claims",
      status:      appState.greenwashing ? "active" : "idle",
      accent:      "#ffb300",
      icon:        <AlertIcon />,
      tasksToday:  appState.greenwashing?.report.reasons.length ?? 34,
      avgTime:     "3.2s",
      activity:    appState.greenwashing ? `Risk Score: ${appState.greenwashing.report.risk_score}/100 (${appState.greenwashing.report.risk_level})` : "Monitoring risk indicators",
    },
  ];

  return (
    <section aria-labelledby="agents-heading">
      <div className="flex items-center justify-between mb-4">
        <h2 id="agents-heading" className="font-display font-semibold text-white text-sm">
          AI Agents
          <span className="ml-2 text-xs font-normal text-slate-500">4 active</span>
        </h2>
        <span className="text-[11px] text-[#00ffaa] font-mono">Backend Engine Active</span>
      </div>
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {agents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>
    </section>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────
function ShieldCheckIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}
function LeafIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  );
}
function ScaleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="3" x2="12" y2="21" />
      <path d="M3 9l9-6 9 6" />
      <path d="M5 9l-2 8h14l-2-8" />
    </svg>
  );
}
function AlertIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}
