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
import { StatCard }              from "@/components/dashboard/StatCard";
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

// ─── KPI Stat Data ────────────────────────────────────────────────────────────

const KPI_STATS = [
  {
    label:      "Portfolio EcoScore",
    value:      87,
    unit:       "/ 100",
    delta:      3.2,
    deltaLabel: "vs last month",
    icon:       "🌿",
    color:      "green" as const,
  },
  {
    label:      "Carbon Reduced",
    value:      "18.4",
    unit:       "kt CO₂e",
    delta:      18,
    deltaLabel: "YoY reduction",
    icon:       "🍃",
    color:      "blue" as const,
  },
  {
    label:      "Active Eco Labels",
    value:      382,
    unit:       "certs",
    delta:      12,
    deltaLabel: "new this month",
    icon:       "🏅",
    color:      "purple" as const,
  },
  {
    label:      "Products Verified",
    value:      147,
    unit:       "SKUs",
    delta:      -2,
    deltaLabel: "2 pending review",
    icon:       "📦",
    color:      "amber" as const,
  },
] as const;

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
        {/* ── KPI Stat Cards ─────────────────────────────────── */}
        <section aria-label="Key performance indicators">
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {KPI_STATS.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>
        </section>

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
