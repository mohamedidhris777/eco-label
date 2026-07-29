/**
 * EcoLabel X — Analytics & Insights Page
 * Route: /dashboard/analytics
 */
"use client";

import { DashboardTopNav } from "@/components/dashboard/DashboardTopNav";
import { useApp } from "@/context/AppContext";

import { useEffect, useState } from "react";

export default function AnalyticsPage() {
  const { state } = useApp();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <DashboardTopNav
        title="Analytics & Compliance Intelligence"
        subtitle="Portfolio benchmarking, claim verification trends, and audit readiness."
      />

      <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {mounted && state.filename && (
          <div className="p-4 rounded-xl bg-[rgba(155,89,255,0.04)] border border-[rgba(155,89,255,0.2)] text-xs text-[#9b59ff]">
             Analytics Dataset Loaded: <span className="font-semibold">{state.filename}</span>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
            <h3 className="text-white font-semibold text-sm">Claim Category Distribution</h3>
            <div className="space-y-3">
              {[
                { cat: "Renewable Energy & Power", pct: 35, color: "#00ffaa" },
                { cat: "Carbon & Greenhouse Gas", pct: 28, color: "#00c8ff" },
                { cat: "Sustainable Packaging", pct: 22, color: "#9b59ff" },
                { cat: "Supply Chain & Sourcing", pct: 15, color: "#ffb300" },
              ].map((c) => (
                <div key={c.cat}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">{c.cat}</span>
                    <span className="text-white font-semibold">{c.pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${c.pct}%`, backgroundColor: c.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
            <h3 className="text-white font-semibold text-sm">Audit Compliance Index</h3>
            <div className="flex items-center justify-center p-6">
              <div className="text-center space-y-2">
                <p className="text-5xl font-display font-bold text-[#00ffaa]">94.2%</p>
                <p className="text-xs text-slate-400">EU ESPR & FTC Green Guide Compliance Readiness</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
