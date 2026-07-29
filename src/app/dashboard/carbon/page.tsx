/**
 * EcoLabel X — Carbon Accounting Page
 * Route: /dashboard/carbon
 */
"use client";

import { DashboardTopNav } from "@/components/dashboard/DashboardTopNav";
import { useApp } from "@/context/AppContext";

import { useEffect, useState } from "react";

export default function CarbonPage() {
  const { state } = useApp();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <DashboardTopNav
        title="Carbon Accounting & Lifecycle Analysis"
        subtitle="Scope 1, Scope 2, and Scope 3 carbon footprint breakdown."
      />

      <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {mounted && state.filename && (
          <div className="p-4 rounded-xl bg-[rgba(0,200,255,0.04)] border border-[rgba(0,200,255,0.2)] text-xs text-[#00c8ff]">
             Carbon Accounting for Report: <span className="font-semibold">{state.filename}</span>
          </div>
        )}

        <div className="grid sm:grid-cols-3 gap-4">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Scope 1 Direct</span>
            <p className="text-3xl font-display font-bold text-[#00ffaa]">1.2 <span className="text-sm font-normal text-slate-400">kt CO₂e</span></p>
            <p className="text-xs text-slate-500">Onsite manufacturing & fleet operations</p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Scope 2 Energy</span>
            <p className="text-3xl font-display font-bold text-[#00c8ff]">1.8 <span className="text-sm font-normal text-slate-400">kt CO₂e</span></p>
            <p className="text-xs text-slate-500">Purchased electricity & facility heating</p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Scope 3 Value Chain</span>
            <p className="text-3xl font-display font-bold text-[#9b59ff]">15.4 <span className="text-sm font-normal text-slate-400">kt CO₂e</span></p>
            <p className="text-xs text-slate-500">Raw materials, freight & consumer end-of-life</p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
          <h3 className="text-white font-semibold text-sm">Carbon Intensity Reductions</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">Raw Material Procurement</span>
                <span className="text-[#00ffaa] font-semibold">-24% YoY</span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#00ffaa] to-[#00c8ff] w-[76%]" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">Freight & Distribution</span>
                <span className="text-[#00c8ff] font-semibold">-18% YoY</span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#00c8ff] to-[#9b59ff] w-[82%]" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
