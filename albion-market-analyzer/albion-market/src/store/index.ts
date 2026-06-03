// src/store/index.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MarketFilters, UserSettings, SyncStatus } from "@/types";

interface AppState {
  filters: MarketFilters;
  settings: UserSettings;
  syncStatus: SyncStatus;
  alertRoiThreshold: number;
  setFilters: (filters: Partial<MarketFilters>) => void;
  resetFilters: () => void;
  setSettings: (settings: Partial<UserSettings>) => void;
  setSyncStatus: (status: Partial<SyncStatus>) => void;
  setAlertRoiThreshold: (value: number) => void;
}

const defaultFilters: MarketFilters = {
  city: undefined,
  tier: null,
  enchantment: null,
  minRoi: 0,
  minProfit: 0,
  quality: null,
  search: "",
};

const defaultSettings: UserSettings = {
  marketFee: 0.025,
  premiumFee: 0.0,
  minRoi: 5,
  minProfit: 10000,
  soundAlerts: true,
  autoRefresh: true,
  refreshInterval: 60,
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      filters: defaultFilters,
      settings: defaultSettings,
      syncStatus: {
        status: "idle",
        lastSync: null,
        itemsCount: 0,
        duration: 0,
      },
      alertRoiThreshold: 20,

      setFilters: (filters) =>
        set((state) => ({ filters: { ...state.filters, ...filters } })),

      resetFilters: () => set({ filters: defaultFilters }),

      setSettings: (settings) =>
        set((state) => ({ settings: { ...state.settings, ...settings } })),

      setSyncStatus: (status) =>
        set((state) => ({ syncStatus: { ...state.syncStatus, ...status } })),

      setAlertRoiThreshold: (value) => set({ alertRoiThreshold: value }),
    }),
    {
      name: "albion-market-store",
      partialize: (state) => ({
        filters: state.filters,
        settings: state.settings,
        alertRoiThreshold: state.alertRoiThreshold,
      }),
    }
  )
);
