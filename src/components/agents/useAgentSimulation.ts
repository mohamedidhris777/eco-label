/**
 * EcoLabel X — AI Mission Control: useAgentSimulation
 *
 * A self-contained useReducer simulation that drives all five agents
 * through a sequential pipeline. A single `setInterval` fires every
 * second and advances the simulation forward.
 *
 * Pipeline order:  Report Reader → Claim Detector → Evidence Verifier
 *                  → Greenwashing Analyzer → Audit Generator
 */
"use client";

import { useEffect, useReducer, useRef, useCallback } from "react";
import type { Agent, AgentAction, AgentStatus, AgentLog } from "./types";

// ─── Initial agent definitions ────────────────────────────────────────────────

const INITIAL_AGENTS: Agent[] = [
  {
    id:          "report-reader",
    index:       1,
    name:        "Report Reader",
    description: "Parses PDF sustainability reports and extracts structured data",
    icon:        "📄",
    accent:      "#00ffaa",
    status:      "active",
    progress:    0,
    confidence:  0,
    runtimeMs:   0,
    tasksTotal:  24,
    tasksDone:   0,
    tokensUsed:  0,
    logs: [
      { time: "00:00:00", message: "Initializing PDF parser engine…",         level: "info"    },
      { time: "00:00:01", message: "Loading sustainability_report_q2.pdf",    level: "info"    },
      { time: "00:00:02", message: "OCR scan started — 48 pages detected",    level: "info"    },
    ],
  },
  {
    id:          "claim-detector",
    index:       2,
    name:        "Claim Detector",
    description: "Identifies and classifies sustainability claims in text",
    icon:        "🔍",
    accent:      "#00c8ff",
    status:      "waiting",
    progress:    0,
    confidence:  0,
    runtimeMs:   0,
    tasksTotal:  61,
    tasksDone:   0,
    tokensUsed:  0,
    logs: [
      { time: "00:00:00", message: "Awaiting Report Reader output…",           level: "info"    },
    ],
  },
  {
    id:          "evidence-verifier",
    index:       3,
    name:        "Evidence Verifier",
    description: "Cross-references claims against 400+ certification databases",
    icon:        "✅",
    accent:      "#9b59ff",
    status:      "waiting",
    progress:    0,
    confidence:  0,
    runtimeMs:   0,
    tasksTotal:  61,
    tasksDone:   0,
    tokensUsed:  0,
    logs: [
      { time: "00:00:00", message: "Standby — awaiting claim list…",           level: "info"    },
    ],
  },
  {
    id:          "greenwashing-analyzer",
    index:       4,
    name:        "Greenwashing Analyzer",
    description: "Scores misleading claim risk using regulatory frameworks",
    icon:        "⚠️",
    accent:      "#ffb300",
    status:      "waiting",
    progress:    0,
    confidence:  0,
    runtimeMs:   0,
    tasksTotal:  61,
    tasksDone:   0,
    tokensUsed:  0,
    logs: [
      { time: "00:00:00", message: "Ready — EU ESPR & FTC rulesets loaded",    level: "info"    },
    ],
  },
  {
    id:          "audit-generator",
    index:       5,
    name:        "Audit Generator",
    description: "Compiles verified findings into a regulatory-grade audit report",
    icon:        "📋",
    accent:      "#ff6b9d",
    status:      "waiting",
    progress:    0,
    confidence:  0,
    runtimeMs:   0,
    tasksTotal:  8,
    tasksDone:   0,
    tokensUsed:  0,
    logs: [
      { time: "00:00:00", message: "Template engine ready — EU v2.4",          level: "info"    },
    ],
  },
];

// ─── Log templates per agent ──────────────────────────────────────────────────

const LOG_POOL: Record<string, { message: string; level: AgentLog["level"] }[]> = {
  "report-reader": [
    { message: "Extracted section: Executive Summary",          level: "info"    },
    { message: "Extracted section: Supply Chain Overview",      level: "info"    },
    { message: "Detected 14 carbon emission figures",           level: "success" },
    { message: "Parsing GHG protocol methodology block",        level: "info"    },
    { message: "Image OCR: label scan complete (3 logos)",      level: "success" },
    { message: "Skipping appendix — non-standard format",       level: "warn"    },
    { message: "Extracted 61 sustainability claim candidates",  level: "success" },
  ],
  "claim-detector": [
    { message: "Running NLP claim extraction model v3.1",       level: "info"    },
    { message: "Classified: 'carbon neutral' → scope 3 claim", level: "success" },
    { message: "Classified: '100% recyclable' → packaging",    level: "success" },
    { message: "Low-confidence claim flagged: 'eco-friendly'", level: "warn"    },
    { message: "Classified: 'net zero by 2040' → targets",     level: "success" },
    { message: "14 claims pending evidence verification",       level: "info"    },
    { message: "Claim map serialized → 42 KB JSON",            level: "info"    },
  ],
  "evidence-verifier": [
    { message: "Querying EU Ecolabel registry…",                level: "info"    },
    { message: "Match: ISO 14001:2015 — VERIFIED",              level: "success" },
    { message: "Match: EU Organic #EO-2024-8821 — VERIFIED",    level: "success" },
    { message: "No match for 'biodegradable' claim — FLAGGED",  level: "warn"    },
    { message: "Querying GHG Protocol emissions factors…",      level: "info"    },
    { message: "Carbon figure cross-reference: ±3% accuracy",  level: "success" },
    { message: "3 claims failed verification — escalating",     level: "warn"    },
  ],
  "greenwashing-analyzer": [
    { message: "Loading FTC Green Guides 2024 ruleset",         level: "info"    },
    { message: "Loading EU ESPR Article 22 framework",          level: "info"    },
    { message: "Claim '100% natural' — HIGH RISK (no cert)",   level: "warn"    },
    { message: "Claim 'carbon neutral' — MEDIUM RISK",          level: "warn"    },
    { message: "Risk model: GW Score = 34 / 100 (Low-Med)",    level: "success" },
    { message: "Generating risk justification narrative…",      level: "info"    },
    { message: "Risk analysis complete — report ready",         level: "success" },
  ],
  "audit-generator": [
    { message: "Compiling evidence matrix…",                    level: "info"    },
    { message: "Inserting verification table (61 rows)",        level: "info"    },
    { message: "Rendering executive summary section",           level: "info"    },
    { message: "Applying ISO 14064-3 report template",         level: "info"    },
    { message: "Appending greenwashing risk annexe",            level: "info"    },
    { message: "PDF export: audit_report_2026_q2.pdf (2.4 MB)",level: "success" },
    { message: "Audit complete — Trust Score: 87/100",          level: "success" },
  ],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function msToHMS(ms: number): string {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return [h, m, sec].map((v) => String(v).padStart(2, "0")).join(":");
}

function appendLog(logs: AgentLog[], msg: { message: string; level: AgentLog["level"] }, runtimeMs: number): AgentLog[] {
  const newLog: AgentLog = { ...msg, time: msToHMS(runtimeMs) };
  return [...logs.slice(-9), newLog]; // keep last 10
}

// ─── Reducer ─────────────────────────────────────────────────────────────────

// How many simulation ticks (seconds) each agent takes to reach 100%
const AGENT_DURATION_TICKS: Record<string, number> = {
  "report-reader":         28,
  "claim-detector":        22,
  "evidence-verifier":     32,
  "greenwashing-analyzer": 18,
  "audit-generator":       14,
};

function agentReducer(state: Agent[], action: AgentAction): Agent[] {
  switch (action.type) {

    case "TICK": {
      return state.map((agent, idx) => {
        // Skip paused/complete/error agents
        if (agent.status === "paused" || agent.status === "complete" || agent.status === "error") {
          return agent;
        }

        // Waiting — activate once previous agent is complete (or this is agent 0)
        if (agent.status === "waiting") {
          const prevComplete = idx === 0 || state[idx - 1].status === "complete";
          if (!prevComplete) return agent;
          return {
            ...agent,
            status: "active",
            logs: appendLog(agent.logs, { message: `Agent started — pipeline slot ${agent.index} activated`, level: "info" }, 0),
          };
        }

        // Active — advance progress
        if (agent.status === "active") {
          const duration    = AGENT_DURATION_TICKS[agent.id] ?? 20;
          const increment   = 100 / duration;
          const newProgress = Math.min(agent.progress + increment + (Math.random() * 2 - 1), 100);
          const newRuntime  = agent.runtimeMs + 1000;
          const newConfidence = Math.min(
            agent.confidence + (3 + Math.random() * 4),
            agent.index === 1 ? 94 :
            agent.index === 2 ? 91 :
            agent.index === 3 ? 88 :
            agent.index === 4 ? 96 :
            89
          );
          const newTasksDone  = Math.min(
            Math.round((newProgress / 100) * agent.tasksTotal),
            agent.tasksTotal
          );
          const newTokens     = agent.tokensUsed + Math.round(Math.random() * 420 + 80);

          // Maybe add a log entry (1-in-4 chance each tick)
          const pool = LOG_POOL[agent.id] ?? [];
          let newLogs = agent.logs;
          if (pool.length > 0 && Math.random() < 0.28) {
            const usedMessages = new Set(agent.logs.map((l) => l.message));
            const available    = pool.filter((l) => !usedMessages.has(l.message));
            if (available.length > 0) {
              const pick = available[Math.floor(Math.random() * available.length)];
              newLogs = appendLog(agent.logs, pick, newRuntime);
            }
          }

          // Complete?
          if (newProgress >= 100) {
            return {
              ...agent,
              status:     "complete",
              progress:   100,
              runtimeMs:  newRuntime,
              confidence: newConfidence,
              tasksDone:  agent.tasksTotal,
              tokensUsed: newTokens,
              logs: appendLog(newLogs, { message: "✓ Agent pipeline stage complete", level: "success" }, newRuntime),
            };
          }

          return {
            ...agent,
            progress:   newProgress,
            runtimeMs:  newRuntime,
            confidence: newConfidence,
            tasksDone:  newTasksDone,
            tokensUsed: newTokens,
            logs:       newLogs,
          };
        }

        return agent;
      });
    }

    case "TOGGLE_PAUSE": {
      return state.map((a) => {
        if (a.id !== action.id) return a;
        if (a.status === "active") return { ...a, status: "paused" };
        if (a.status === "paused") return { ...a, status: "active" };
        return a;
      });
    }

    case "RESET_ALL":
      return INITIAL_AGENTS.map((a) => ({ ...a }));

    case "SET_ERROR": {
      return state.map((a) =>
        a.id === action.id
          ? { ...a, status: "error", logs: appendLog(a.logs, { message: "⚠ Simulation error injected for demo", level: "error" }, a.runtimeMs) }
          : a
      );
    }

    default:
      return state;
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAgentSimulation() {
  const [agents, dispatch] = useReducer(agentReducer, INITIAL_AGENTS);
  const intervalRef        = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-start the ticker
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      dispatch({ type: "TICK" });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const togglePause = useCallback((id: string) => {
    dispatch({ type: "TOGGLE_PAUSE", id });
  }, []);

  const resetAll = useCallback(() => {
    dispatch({ type: "RESET_ALL" });
  }, []);

  const injectError = useCallback((id: string) => {
    dispatch({ type: "SET_ERROR", id });
  }, []);

  // Derived stats
  const allComplete = agents.every((a) => a.status === "complete");
  const activeCount = agents.filter((a) => a.status === "active").length;
  const totalProgress = Math.round(
    agents.reduce((sum, a) => sum + a.progress, 0) / agents.length
  );

  return {
    agents,
    togglePause,
    resetAll,
    injectError,
    allComplete,
    activeCount,
    totalProgress,
  };
}
