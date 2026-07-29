/**
 * EcoLabel X — Dashboard Overview Page
 *
 * Layout:
 *  ┌──────── TopNav ─────────────────────────────────────────┐
 *  │  KPI stat cards row                                      │
 *  │  AI Agent status cards row                               │
 *  │                                                          │
 *  │  ┌── Trust Score ──┐ ┌── Carbon Score ──┐ ┌── Upload ──┐│
 *  │  │                 │ │                  │ │            ││
 *  │  └─────────────────┘ └──────────────────┘ └────────────┘│
 *  │                                                          │
 *  │  ┌── Greenwashing Risk ───────────────────────────────┐  │
 *  │  │                                                    │  │
 *  │  └────────────────────────────────────────────────────┘  │
 *  │                                                          │
 *  │  Recent Analyses table                                   │
 *  └──────────────────────────────────────────────────────────┘
 */
import type { Metadata } from "next";
import { DashboardTopNav }       from "@/components/dashboard/DashboardTopNav";
import { OverviewKpis }          from "@/components/dashboard/OverviewKpis";
import { AIAgentStatusCards }    from "@/components/dashboard/AIAgentStatusCards";
import { UploadCard }            from "@/components/dashboard/UploadCard";
import { TrustScoreCard }        from "@/components/dashboard/TrustScoreCard";
import { GreenwashingRiskCard }   from "@/components/dashboard/GreenwashingRiskCard";
import { CarbonScoreCard }       from "@/components/dashboard/CarbonScoreCard";
import { RecentAnalyses }        from "@/components/dashboard/RecentAnalyses";

export const metadata: Metadata = {
  title:       "Dashboard — EcoLabel X",
  description: "Your sustainability intelligence overview.",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  return (
    <>
      {/* Sticky top navigation */}
      <DashboardTopNav
        title="Overview"
        subtitle="Your sustainability intelligence at a glance."
      />

      {/* Scrollable content area */}
      <main
        id="dashboard-content"
        className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8"
      >
        {/* ── KPI Stat Cards (Dynamic) ───────────────────────── */}
        <OverviewKpis />

        {/* ── AI Agent Status Cards ───────────────────────────── */}
        <AIAgentStatusCards />

        {/* ── Three-column insight cards ──────────────────────── */}
        <section
          aria-label="Sustainability insights"
          className="grid grid-cols-1 lg:grid-cols-3 gap-4"
        >
          {/* Trust Score (wide) */}
          <div className="lg:col-span-1">
            <TrustScoreCard />
          </div>

          {/* Carbon Score (wide) */}
          <div className="lg:col-span-1">
            <CarbonScoreCard />
          </div>

          {/* Upload (narrow) */}
          <div className="lg:col-span-1">
            <UploadCard />
          </div>
        </section>

        {/* ── Greenwashing Risk ───────────────────────────────── */}
        <section aria-label="Greenwashing risk">
          <GreenwashingRiskCard />
        </section>

        {/* ── Recent Analyses Table ───────────────────────────── */}
        <RecentAnalyses />

        {/* Bottom spacer for comfortable scrolling */}
        <div className="h-4" aria-hidden="true" />
      </main>
    </>
  );
}
