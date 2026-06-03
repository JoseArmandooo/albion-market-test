// src/app/dashboard/page.tsx
import { Suspense } from "react";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { MarketFilters } from "@/components/dashboard/MarketFilters";
import { MarketTable } from "@/components/dashboard/MarketTable";
import { Rankings } from "@/components/dashboard/Rankings";
import { AlertsPanel } from "@/components/dashboard/AlertsPanel";

export const metadata = {
  title: "Dashboard | Albion Market Analyzer",
};

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-6 space-y-6 max-w-[1600px]">
      {/* Stats overview */}
      <StatsCards />

      {/* Main content area */}
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        {/* Left: filters + table */}
        <div className="space-y-4">
          <div className="rounded-xl border border-white/5 bg-black/40 backdrop-blur-sm p-4">
            <Suspense>
              <MarketFilters />
            </Suspense>
          </div>
          <Suspense>
            <MarketTable />
          </Suspense>
        </div>

        {/* Right: rankings + alerts */}
        <div className="space-y-6">
          <Rankings />
          <AlertsPanel />
        </div>
      </div>
    </div>
  );
}
