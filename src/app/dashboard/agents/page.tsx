/**
 * EcoLabel X — AI Agents Management Page
 * Route: /dashboard/agents
 */
"use client";

import { DashboardTopNav } from "@/components/dashboard/DashboardTopNav";
import { AIAgentStatusCards } from "@/components/dashboard/AIAgentStatusCards";

export default function AgentsPage() {
  return (
    <>
      <DashboardTopNav
        title="AI Agents Control Center"
        subtitle="Monitor and configure specialized autonomous AI verification agents."
      />

      <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <AIAgentStatusCards />
      </main>
    </>
  );
}
