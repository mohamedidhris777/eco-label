/**
 * EcoLabel X — Products Directory
 * Route: /dashboard/products
 */
"use client";

import { DashboardTopNav } from "@/components/dashboard/DashboardTopNav";
import { useApp } from "@/context/AppContext";

import { useEffect, useState } from "react";

export default function ProductsPage() {
  const { state } = useApp();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const products = [
    { id: "SKU-4092", name: "EcoCotton Organic Tee", category: "Apparel & Textiles", score: 92, certs: 4, carbon: "2.4 kg CO₂e", status: "Verified" },
    { id: "SKU-8821", name: "BioBottle Plant-Based 500ml", category: "Packaging", score: 88, certs: 3, carbon: "0.8 kg CO₂e", status: "Verified" },
    { id: "SKU-1044", name: "CleanHome Multi-Surface Cleaner", category: "Household", score: 76, certs: 2, carbon: "4.1 kg CO₂e", status: "Review" },
    { id: "SKU-5590", name: "SolarCharge Portable Power 10kW", category: "Electronics", score: 94, certs: 5, carbon: "12.3 kg CO₂e", status: "Verified" },
  ];

  return (
    <>
      <DashboardTopNav
        title="Products Directory"
        subtitle="Manage product SKUs, sustainability scores, and verified lifecycle claims."
      />

      <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {mounted && state.filename && (
          <div className="p-4 rounded-xl bg-[rgba(0,255,170,0.04)] border border-[rgba(0,255,170,0.2)] text-xs text-[#00ffaa]">
             Active Analysis: <span className="font-semibold">{state.filename}</span> ({state.pageCount} pages parsed)
          </div>
        )}

        <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 font-semibold bg-white/5">
                <th className="p-4">SKU ID</th>
                <th className="p-4">Product Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">EcoScore</th>
                <th className="p-4">Carbon Impact</th>
                <th className="p-4">Certs</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-mono text-[#00c8ff] font-semibold">{p.id}</td>
                  <td className="p-4 font-semibold text-white">{p.name}</td>
                  <td className="p-4 text-slate-400">{p.category}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full font-bold text-[#00ffaa] bg-[#00ffaa]/10 border border-[#00ffaa]/20">
                      {p.score}/100
                    </span>
                  </td>
                  <td className="p-4 text-slate-300">{p.carbon}</td>
                  <td className="p-4 text-slate-400">{p.certs} labels</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${p.status === "Verified" ? "text-[#00ffaa] bg-[#00ffaa]/10" : "text-amber-400 bg-amber-400/10"}`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
