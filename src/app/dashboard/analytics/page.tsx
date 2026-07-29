/**
 * EcoLabel X — Analytics & Insights Page (Dynamic & Live)
 * Route: /dashboard/analytics
 */
"use client";

import { DashboardTopNav } from "@/components/dashboard/DashboardTopNav";
import { useApp } from "@/context/AppContext";
import { extractAnalyticsMetrics } from "@/lib/dynamicMetricsExtractor";
import { useEffect, useState } from "react";

export default function AnalyticsPage() {
  const { state } = useApp();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const analytics = extractAnalyticsMetrics(state);

  return (
    <>
      <DashboardTopNav
        title="Analytics & Compliance Intelligence"
        subtitle="Portfolio benchmarking, claim verification trends, and audit readiness."
      />

      <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {mounted && state.filename && (
          <div className="p-4 rounded-xl bg-[rgba(155,89,255,0.04)] border border-[rgba(155,89,255,0.2)] text-xs text-[#9b59ff] flex items-center justify-between">
            <div>
              Analytics Dataset Loaded: <span className="font-semibold">{state.filename}</span> ({analytics.totalClaimsCount} total claims parsed)
            </div>
            <span className="text-[10px] bg-[#9b59ff]/10 px-2 py-0.5 rounded font-mono">LIVE PDF BENCHMARKS</span>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold text-sm">Claim Category Distribution</h3>
              <span className="text-[11px] text-slate-400 font-mono">{analytics.totalClaimsCount} Claims</span>
            </div>
            <div className="space-y-3">
              {analytics.categories.map((c) => (
                <div key={c.cat}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">{c.cat} ({c.count})</span>
                    <span className="text-white font-semibold">{c.pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.max(c.pct, 4)}%`, backgroundColor: c.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4 flex flex-col justify-between">
            <h3 className="text-white font-semibold text-sm">Audit Compliance Index</h3>
            <div className="flex items-center justify-center p-6 flex-1">
              <div className="text-center space-y-2">
                <p className="text-5xl font-display font-bold text-[#00ffaa]">{analytics.complianceIndex}%</p>
                <p className="text-xs text-slate-400 max-w-[240px] mx-auto">
                  EU ESPR & FTC Green Guide Compliance Readiness ({analytics.verifiedCount} of {analytics.totalClaimsCount} claims verified)
                </p>
              </div>
            </div>
            <div className="pt-4 border-t border-white/10 flex justify-between text-xs text-slate-400">
              <span>Verification Rate: <strong className="text-[#00ffaa] ml-1">{Math.round((analytics.verifiedCount / Math.max(analytics.totalClaimsCount, 1)) * 100)}%</strong></span>
              <span>Audit Readiness: <strong className="text-[#00c8ff] ml-1">High</strong></span>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
