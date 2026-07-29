/**
 * EcoLabel X — Products Directory
 * Route: /dashboard/products
 *
 * Dynamically lists all product entities and sustainability items extracted from the uploaded PDF.
 * Zero hardcoded mock arrays or fake data.
 */
"use client";

import { useEffect, useState, useMemo } from "react";
import { DashboardTopNav } from "@/components/dashboard/DashboardTopNav";
import { useApp } from "@/context/AppContext";
import { extractProductsFromAnalysis, type ProductItem } from "@/lib/productExtractor";

const PAGE_SIZE = 15;

export default function ProductsPage() {
  const { state } = useApp();
  const [mounted, setMounted] = useState(false);
  const [search, setSearch]   = useState("");
  const [page, setPage]       = useState(1);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Dynamically extract all products from active document analysis
  const dynamicProducts = useMemo(() => {
    return extractProductsFromAnalysis(state);
  }, [state]);

  // Filter products by search query
  const filteredProducts = useMemo(() => {
    if (!search.trim()) return dynamicProducts;
    const q = search.toLowerCase();
    return dynamicProducts.filter(
      (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)
    );
  }, [dynamicProducts, search]);

  const totalPages = Math.ceil(filteredProducts.length / PAGE_SIZE) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredProducts.slice(start, start + PAGE_SIZE);
  }, [filteredProducts, page]);

  return (
    <>
      <DashboardTopNav
        title="Products Directory"
        subtitle="Manage product SKUs, sustainability scores, and verified lifecycle claims extracted from your document."
      />

      <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* Status & Search Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            {mounted && state.filename ? (
              <div className="p-3 px-4 rounded-xl bg-[rgba(0,255,170,0.04)] border border-[rgba(0,255,170,0.2)] text-xs text-[#00ffaa]">
                Active Analysis: <span className="font-semibold">{state.filename}</span> ({state.pageCount} pages parsed &bull; {dynamicProducts.length} items detected)
              </div>
            ) : (
              <div className="p-3 px-4 rounded-xl bg-slate-800/40 border border-slate-700/40 text-xs text-slate-400">
                Upload a sustainability report to view real extracted products & SKUs.
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <input
              type="search"
              placeholder="Search SKUs, products, categories..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="px-3.5 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white placeholder-slate-500 outline-none focus:border-[#00ffaa]"
            />
          </div>
        </div>

        {/* Products Table */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 font-semibold bg-white/5">
                <th className="p-4">SKU ID</th>
                <th className="p-4">Product / Item Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Page</th>
                <th className="p-4">EcoScore</th>
                <th className="p-4">Carbon Impact</th>
                <th className="p-4">Certs</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {paginatedProducts.length > 0 ? (
                paginatedProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-mono text-[#00c8ff] font-semibold">{p.id}</td>
                    <td className="p-4 font-semibold text-white max-w-[280px] truncate" title={p.name}>{p.name}</td>
                    <td className="p-4 text-slate-400">{p.category}</td>
                    <td className="p-4 text-slate-400 font-mono">P. {p.page}</td>
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
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    No products matching filter criteria. Upload a PDF sustainability report to generate dynamic product entries.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
              <span>Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredProducts.length)} of {filteredProducts.length} items</span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-lg border border-white/10 text-slate-300 disabled:opacity-40 hover:bg-white/5 transition-all"
                >
                  Previous
                </button>
                <span className="px-2 font-mono">{page} / {totalPages}</span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 rounded-lg border border-white/10 text-slate-300 disabled:opacity-40 hover:bg-white/5 transition-all"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
