/**
 * EcoLabel X — AI Mission Control: Shared Types
 */

export type AgentStatus =
  | "idle"        // not yet started
  | "waiting"     // waiting for previous agent to finish
  | "active"      // currently running
  | "paused"      // manually paused
  | "complete"    // finished successfully
  | "error";      // failed

export interface AgentLog {
  time:    string;   // e.g. "00:01:23"
  message: string;
  level:   "info" | "warn" | "success" | "error";
}

export interface Agent {
  id:          string;
  index:       number;   // 1–5, pipeline order
  name:        string;
  description: string;
  icon:        string;   // emoji
  accent:      string;   // hex colour
  status:      AgentStatus;
  progress:    number;   // 0–100
  confidence:  number;   // 0–100
  runtimeMs:   number;   // elapsed ms
  tasksTotal:  number;   // total tasks for this run
  tasksDone:   number;   // completed tasks
  tokensUsed:  number;
  logs:        AgentLog[];
}

// Discriminated union for the simulation reducer
export type AgentAction =
  | { type: "TICK" }                               // called every second
  | { type: "TOGGLE_PAUSE"; id: string }
  | { type: "RESET_ALL" }
  | { type: "SET_ERROR";  id: string };
