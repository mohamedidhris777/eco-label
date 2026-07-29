/**
 * EcoLabel X — Eco Labels Registry
 * Route: /dashboard/labels
 */
"use client";

import { DashboardTopNav } from "@/components/dashboard/DashboardTopNav";
import { useApp } from "@/context/AppContext";

import { useEffect, useState } from "react";

export default function LabelsPage() {
  const { state } = useApp();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const labels = [
    { name: "EU Organic Certification", issuer: "European Commission", category: "Agriculture", status: "Verified", validity: "2026-12-31" },
    { name: "FSC Certified Packaging", issuer: "Forest Stewardship Council", category: "Forestry", status: "Verified", validity: "2027-06-30" },
    { name: "ISO 14064 GHG Verified", issuer: "TÜV SÜD", category: "Emissions", status: "Verified", validity: "2026-11-15" },
    { name: "Carbon Neutral Product Mark", issuer: "Climate Impact Partners", category: "Carbon", status: "Under Review", validity: "Pending" },
  ];

  return (
    <>
      <DashboardTopNav
        title="Eco Labels & Certifications"
        subtitle="Verification registry for environmental labels and third-party certifications."
      />

      <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {mounted && state.filename && (
          <div className="p-4 rounded-xl bg-[rgba(0,255,170,0.04)] border border-[rgba(0,255,170,0.2)] text-xs text-[#00ffaa]">
             Verified against report: <span className="font-semibold">{state.filename}</span>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          {labels.map((l) => (
            <div
              key={l.name}
              className="p-5 rounded-2xl space-y-3"
              style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-white font-semibold text-sm">{l.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{l.issuer}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${l.status === "Verified" ? "text-[#00ffaa] bg-[#00ffaa]/10 border border-[#00ffaa]/20" : "text-amber-400 bg-amber-400/10 border border-amber-400/20"}`}>
                  {l.status}
                </span>
              </div>
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
