/**
 * EcoLabel X — Eco Labels Registry (Dynamic & Live)
 * Route: /dashboard/labels
 */
"use client";

import { DashboardTopNav } from "@/components/dashboard/DashboardTopNav";
import { useApp } from "@/context/AppContext";
import { extractEcoLabels } from "@/lib/dynamicMetricsExtractor";
import { useEffect, useState } from "react";

export default function LabelsPage() {
  const { state } = useApp();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const labels = extractEcoLabels(state);

  return (
    <>
      <DashboardTopNav
        title="Eco Labels & Certifications"
        subtitle="Verification registry for environmental labels and third-party certifications."
      />

      <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {mounted && state.filename && (
          <div className="p-4 rounded-xl bg-[rgba(0,255,170,0.04)] border border-[rgba(0,255,170,0.2)] text-xs text-[#00ffaa] flex items-center justify-between">
            <div>
              Verified against report: <span className="font-semibold">{state.filename}</span> ({labels.length} certifications identified)
            </div>
            <span className="text-[10px] bg-[#00ffaa]/10 px-2 py-0.5 rounded font-mono">LIVE PDF ANALYSIS</span>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          {labels.map((l) => (
            <div
              key={l.name}
              className="p-5 rounded-2xl space-y-3 transition-all hover:border-[#00ffaa]/30"
              style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-white font-semibold text-sm">{l.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{l.issuer}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${l.status === "Verified" ? "text-[#00ffaa] bg-[#00ffaa]/10 border border-[#00ffaa]/20" : l.status === "Under Review" ? "text-amber-400 bg-amber-400/10 border border-amber-400/20" : "text-red-400 bg-red-400/10 border border-red-400/20"}`}>
                  {l.status}
                </span>
              </div>

              {l.claimExcerpt && (
                <p className="text-[11px] text-slate-400 italic bg-white/[0.02] p-2 rounded-lg border border-white/5">
                  "{l.claimExcerpt}" {l.page ? <span className="not-italic text-[#00ffaa] ml-1">(Page {l.page})</span> : null}
                </p>
              )}

              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-white/5">
                <span>Category: <strong className="text-slate-300 font-normal">{l.category}</strong></span>
                <span>Valid Until: <strong className="text-slate-300 font-normal">{l.validity}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
