/**
 * EcoLabel X — Settings Page
 * Route: /dashboard/settings
 */
"use client";

import { DashboardTopNav } from "@/components/dashboard/DashboardTopNav";

export default function SettingsPage() {
  return (
    <>
      <DashboardTopNav
        title="Settings"
        subtitle="Manage API keys, environment configuration, and preferences."
      />

      <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div
          className="rounded-2xl p-6 space-y-6"
          style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div>
            <h3 className="text-white font-semibold text-base mb-1">Backend Connection</h3>
            <p className="text-xs text-slate-400">
              FastAPI Endpoint: <span className="font-mono text-[#00ffaa]">http://localhost:8000</span>
            </p>
          </div>

          <div className="border-t border-white/5 pt-4">
            <h3 className="text-white font-semibold text-base mb-1">Gemini AI Verification Layer</h3>
            <p className="text-xs text-slate-400 mb-3">
              Optional API Key for post-detection claim verification (&lt;200 tokens/claim).
            </p>
            <div className="flex items-center gap-3">
              <input
                type="password"
                placeholder="GEMINI_API_KEY"
                className="px-3 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white w-full max-w-md focus:outline-none focus:border-[#00ffaa]"
                readOnly
                value="••••••••••••••••••••••••"
              />
              <span className="px-3 py-1.5 rounded-xl text-[10px] font-semibold text-[#00ffaa] bg-[rgba(0,255,170,0.1)] border border-[rgba(0,255,170,0.2)]">
                Active / Fallback Ready
              </span>
            </div>
          </div>

          <div className="border-t border-white/5 pt-4">
            <h3 className="text-white font-semibold text-base mb-1">Pipeline State Cache</h3>
            <p className="text-xs text-slate-400 mb-3">
              Cross-module localStorage cache allows one-click navigation across all views.
            </p>
            <button
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.localStorage.clear();
                  window.location.reload();
                }
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-red-400 border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 transition-all"
            >
              Clear Local Cache
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
