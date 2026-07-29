/**
 * EcoLabel X — Dynamic Overview KPI Stat Cards
 * Computes live KPIs from active AppState (PDF analysis results).
 */
"use client";

import { useApp } from "@/context/AppContext";
import { StatCard } from "@/components/dashboard/StatCard";
import { extractEcoLabels, extractCarbonMetrics } from "@/lib/dynamicMetricsExtractor";
import { extractProductsFromAnalysis } from "@/lib/productExtractor";

export function OverviewKpis() {
  const { state } = useApp();

  const ecoLabelsCount = extractEcoLabels(state).length;
  const carbonMetrics = extractCarbonMetrics(state);
  const productsCount = extractProductsFromAnalysis(state).length;

  let trustScore = 87;
  if (state.greenwashing?.report.risk_score !== undefined) {
    trustScore = Math.max(15, 100 - state.greenwashing.report.risk_score);
  } else if (state.verification?.summary) {
    trustScore = Math.round((state.verification.summary.verified / (state.verification.summary.total_claims || 1)) * 100);
  }

  const isCustomReport = Boolean(state.filename);

  const stats = [
    {
      label:      "Portfolio EcoScore",
      value:      trustScore,
      unit:       "/ 100",
      delta:      isCustomReport ? (trustScore >= 75 ? 4.5 : -3.2) : 3.2,
      deltaLabel: isCustomReport ? `Audit score for ${state.filename}` : "vs last month",
      icon:       "🌿",
      color:      (trustScore >= 80 ? "green" : trustScore >= 60 ? "amber" : "purple") as "green" | "amber" | "purple",
    },
    {
      label:      "Carbon Footprint",
      value:      String(carbonMetrics.totalEmissions),
      unit:       "kt CO₂e",
      delta:      carbonMetrics.rawMaterialReduction,
      deltaLabel: "YoY reduction",
      icon:       "🍃",
      color:      "blue" as const,
    },
    {
      label:      "Active Eco Labels",
      value:      isCustomReport ? ecoLabelsCount : 382,
      unit:       "certs",
      delta:      isCustomReport ? ecoLabelsCount : 12,
      deltaLabel: isCustomReport ? "Extracted from report" : "new this month",
      icon:       "🏅",
      color:      "purple" as const,
    },
    {
      label:      "Products Verified",
      value:      isCustomReport ? productsCount : 147,
      unit:       "SKUs",
      delta:      isCustomReport ? 0 : -2,
      deltaLabel: isCustomReport ? `${productsCount} detected items` : "2 pending review",
      icon:       "📦",
      color:      "amber" as const,
    },
  ] as const;

  return (
    <section aria-label="Key performance indicators">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>
    </section>
  );
}
