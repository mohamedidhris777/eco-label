/**
 * EcoLabel X — AI Mission Control: Pipeline Connector
 *
 * A horizontal SVG strip showing the five agents as pipeline nodes
 * connected by animated data-flow arrows. Active connections show
 * a travelling packet animation.
 */
"use client";

import { cn } from "@/lib/utils/cn";
import type { Agent } from "./types";

interface PipelineConnectorProps {
  agents: Agent[];
}

export function PipelineConnector({ agents }: PipelineConnectorProps) {
  return (
    <div
      className="rounded-2xl px-6 py-4"
      style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}
      aria-label="Agent pipeline overview"
    >
      <p className="text-[10px] uppercase tracking-widest text-slate-600 mb-3">
        Pipeline Flow
      </p>

      <div className="flex items-center justify-between gap-0">
        {agents.map((agent, idx) => {
          const isActive    = agent.status === "active";
          const isComplete  = agent.status === "complete";
          const isError     = agent.status === "error";
          const isLast      = idx === agents.length - 1;

          const nodeColor =
            isError    ? "#ef4444" :
            isComplete ? "#00ffaa" :
            isActive   ? agent.accent :
                         "#334155";

          const prevComplete = idx === 0 || agents[idx - 1]?.status === "complete";
          const linkActive   = prevComplete && idx > 0 && !isError;

          return (
            <div key={agent.id} className="flex items-center flex-1 min-w-0">
              {/* Connector line + animated packet */}
              {idx > 0 && (
                <div className="relative flex-1 h-px mx-1 overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                  {/* Static filled line for completed segments */}
                  {linkActive && (
                    <div
                      className="absolute inset-y-0 left-0 right-0"
                      style={{
                        background:  `linear-gradient(90deg, ${agents[idx-1].accent}60, ${agent.accent}60)`,
                        opacity: isComplete ? 1 : 0.4,
                      }}
                    />
                  )}
                  {/* Travelling packet */}
                  {isActive && (
                    <div
                      className="absolute top-1/2 -translate-y-1/2 h-1.5 w-6 rounded-full animate-data-flow"
                      style={{ background: agent.accent, boxShadow: `0 0 8px ${agent.accent}` }}
                      aria-hidden="true"
                    />
                  )}
                </div>
              )}

              {/* Node */}
              <div className="flex flex-col items-center flex-shrink-0">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-base",
                    "border-2 transition-all duration-500",
                    isActive && "ring-2 ring-offset-2 ring-offset-[#050a18]",
                  )}
                  style={{
                    background:    isComplete || isActive ? `${nodeColor}18` : "rgba(255,255,255,0.03)",
                    borderColor:   nodeColor,
                    boxShadow:     isActive ? `0 0 16px ${nodeColor}50` : "none",
                  }}
                  aria-label={`${agent.name} — ${agent.status}`}
                >
                  {agent.icon}
                </div>
                <span
                  className="text-[9px] mt-1.5 font-medium text-center leading-tight max-w-[56px] truncate"
                  style={{ color: nodeColor }}
                >
                  {agent.name.split(" ")[0]}
                </span>
                {/* Progress mini bar */}
                <div
                  className="w-10 h-0.5 rounded-full mt-1 overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${agent.progress}%`, background: nodeColor }}
                  />
                </div>
              </div>

              {/* Tail connector (after last node) */}
              {isLast && (
                <div className="flex-1 h-px ml-1" style={{ background: "rgba(255,255,255,0.04)" }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
