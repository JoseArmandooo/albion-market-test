// src/hooks/useMarketData.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { useAppStore } from "@/store";
import type { MarketResponse, RankingResponse, StatsOverview } from "@/types";

export function useMarketData(page = 1, limit = 50) {
  const { filters, settings } = useAppStore();

  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    ...(filters.city && { city: filters.city }),
    ...(filters.tier != null && { tier: String(filters.tier) }),
    ...(filters.enchantment != null && {
      enchantment: String(filters.enchantment),
    }),
    ...(filters.minRoi && { minRoi: String(filters.minRoi) }),
    ...(filters.minProfit && { minProfit: String(filters.minProfit) }),
    ...(filters.quality != null && { quality: String(filters.quality) }),
    ...(filters.search && { search: filters.search }),
  });

  return useQuery<MarketResponse>({
    queryKey: ["market", filters, page, limit],
    queryFn: async () => {
      const res = await fetch(`/api/market?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch market data");
      return res.json();
    },
    refetchInterval: settings.autoRefresh
      ? settings.refreshInterval * 1000
      : false,
    staleTime: 30_000,
  });
}

export function useRankings() {
  const { settings } = useAppStore();

  return useQuery<RankingResponse>({
    queryKey: ["rankings"],
    queryFn: async () => {
      const res = await fetch("/api/rankings");
      if (!res.ok) throw new Error("Failed to fetch rankings");
      return res.json();
    },
    refetchInterval: settings.autoRefresh
      ? settings.refreshInterval * 1000
      : false,
    staleTime: 30_000,
  });
}

export function useStatsOverview() {
  return useQuery<StatsOverview>({
    queryKey: ["stats-overview"],
    queryFn: async () => {
      const res = await fetch("/api/market/stats");
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

export function useSyncMarket() {
  const { setSyncStatus } = useAppStore();

  const triggerSync = async () => {
    setSyncStatus({ status: "syncing" });
    try {
      const res = await fetch("/api/market/sync", { method: "POST" });
      const data = await res.json();
      setSyncStatus({
        status: data.success ? "success" : "error",
        lastSync: new Date().toISOString(),
        itemsCount: data.itemsCount ?? 0,
        duration: data.duration ?? 0,
        error: data.error,
      });
      return data;
    } catch (err) {
      setSyncStatus({
        status: "error",
        error: err instanceof Error ? err.message : "Unknown error",
      });
      throw err;
    }
  };

  return { triggerSync };
}
