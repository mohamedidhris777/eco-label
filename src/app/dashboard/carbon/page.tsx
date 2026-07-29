/**
 * EcoLabel X — Carbon Accounting Page (Dynamic & Live)
 * Route: /dashboard/carbon
 */
"use client";

import { DashboardTopNav } from "@/components/dashboard/DashboardTopNav";
import { useApp } from "@/context/AppContext";
import { extractCarbonMetrics } from "@/lib/dynamicMetricsExtractor";
import { useEffect, useState } from "react";

export default function CarbonPage() {
  const { state } = useApp();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const carbon = extractCarbonMetrics(state);

  return (
    <>
      <DashboardTopNav
        title="Carbon Accounting & Lifecycle Analysis"
        subtitle="Scope 1, Scope 2, and Scope 3 carbon footprint breakdown."
      />

      <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {mounted && state.filename && (
          <div className="p-4 rounded-xl bg-[rgba(0,200,255,0.04)] border border-[rgba(0,200,255,0.2)] text-xs text-[#00c8ff] flex items-center justify-between">
            <div>
              Carbon Accounting for Report: <span className="font-semibold">{state.filename}</span> (Total Footprint: {carbon.totalEmissions} kt CO₂e)
            </div>
            <span className="text-[10px] bg-[#00c8ff]/10 px-2 py-0.5 rounded font-mono">LIVE PDF FOOTPRINT</span>
          </div>
        )}

        <div className="grid sm:grid-cols-3 gap-4">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Scope 1 Direct</span>
            <p className="text-3xl font-display font-bold text-[#00ffaa]">{carbon.scope1} <span className="text-sm font-normal text-slate-400">kt CO₂e</span></p>
            <p className="text-xs text-slate-500">Onsite manufacturing & fleet operations</p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Scope 2 Energy</span>
            <p className="text-3xl font-display font-bold text-[#00c8ff]">{carbon.scope2} <span className="text-sm font-normal text-slate-400">kt CO₂e</span></p>
            <p className="text-xs text-slate-500">Purchased electricity & facility heating</p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Scope 3 Value Chain</span>
            <p className="text-3xl font-display font-bold text-[#9b59ff]">{carbon.scope3} <span className="text-sm font-normal text-slate-400">kt CO₂e</span></p>
            <p className="text-xs text-slate-500">Raw materials, freight & consumer end-of-life</p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold text-sm">Carbon Intensity Reductions & Performance</h3>
            <span className="text-xs text-[#00ffaa] font-semibold">-{carbon.rawMaterialReduction}% Overall YoY</span>
          </div>
          <div className="space-y-4">
            {carbon.categoryReductions.map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">{item.label}</span>
                  <span className="font-semibold" style={{ color: item.color }}>-{item.pct}% YoY</span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(item.pct * 3, 100)}%`, backgroundColor: item.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
