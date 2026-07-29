/**
 * EcoLabel X — Dashboard Layout
 * Wraps all /dashboard/* routes with Sidebar + PipelineBanner.
 */
import { Suspense } from "react";
import { Sidebar }         from "@/components/layout/Sidebar";
import { PipelineBanner }  from "@/components/dashboard/PipelineBanner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-cosmos">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-auto">
        {/* Pipeline banner — client-only (reads localStorage); Suspense prevents SSR error */}
        <Suspense fallback={null}>
          <PipelineBanner />
        </Suspense>
        {children}
      </div>
    </div>
  );
}
