/**
 * EcoLabel X — Backend Status Indicator
 *
 * Polls GET /health on mount and shows a small connected/disconnected badge.
 * Used in dashboard sidebar footer or overview page.
 */
"use client";

import { useEffect, useState } from "react";
import { pingHealth } from "@/lib/api";

type Status = "checking" | "online" | "offline";

export function BackendStatus() {
  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    let cancelled = false;
    pingHealth()
      .then(() => { if (!cancelled) setStatus("online");  })
      .catch(() => { if (!cancelled) setStatus("offline"); });
    return () => { cancelled = true; };
  }, []);

  const cfg = {
    checking: { color: "#94a3b8", dot: "animate-pulse bg-slate-400", label: "Checking…" },
    online:   { color: "#00ffaa", dot: "bg-emerald-400",             label: "Backend online" },
    offline:  { color: "#ef4444", dot: "bg-red-400",                 label: "Backend offline" },
  }[status];

  return (
    <div className="flex items-center gap-2 text-[10px]" style={{ color: cfg.color }}>
      <span
        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`}
        aria-hidden="true"
      />
      {cfg.label}
    </div>
  );
}
