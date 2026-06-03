// src/types/index.ts

export interface AlbionMarketData {
  item_id: string;
  city: string;
  quality: number;
  sell_price_min: number;
  sell_price_min_date: string;
  sell_price_max: number;
  sell_price_max_date: string;
  buy_price_min: number;
  buy_price_min_date: string;
  buy_price_max: number;
  buy_price_max_date: string;
}

export interface FlipOpportunity {
  id: string;
  itemId: string;
  itemName: string;
  tier: number;
  enchantment: number;
  city: string;
  quality: number;
  buyPrice: number;
  sellPrice: number;
  buyVolume: number;
  sellVolume: number;
  grossProfit: number;
  netProfit: number;
  roi: number;
  marketFee: number;
  updatedAt: string;
}

export interface RankingItem extends FlipOpportunity {
  rank: number;
}

export interface MarketFilters {
  city?: string;
  tier?: number | null;
  enchantment?: number | null;
  minRoi?: number;
  minProfit?: number;
  quality?: number | null;
  search?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface MarketResponse {
  items: FlipOpportunity[];
  total: number;
  page: number;
  limit: number;
  lastUpdated: string | null;
}

export interface RankingResponse {
  topFlips: RankingItem[];
  topRoi: RankingItem[];
  topProfit: RankingItem[];
}

export interface SyncStatus {
  status: "idle" | "syncing" | "success" | "error";
  lastSync: string | null;
  itemsCount: number;
  duration: number;
  error?: string;
}

export interface UserSettings {
  marketFee: number;
  premiumFee: number;
  minRoi: number;
  minProfit: number;
  soundAlerts: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
}

export interface Alert {
  id: string;
  itemId: string;
  itemName: string;
  city: string;
  alertType: "ROI" | "PROFIT" | "PRICE_DROP" | "PRICE_SPIKE";
  threshold: number;
  triggered: boolean;
  triggeredAt?: string;
  createdAt: string;
}

export type City =
  | "Caerleon"
  | "Bridgewatch"
  | "Martlock"
  | "Thetford"
  | "Fort Sterling"
  | "Lymhurst"
  | "Brecilien"
  | "Black Market";

export const CITIES: City[] = [
  "Caerleon",
  "Bridgewatch",
  "Martlock",
  "Thetford",
  "Fort Sterling",
  "Lymhurst",
  "Brecilien",
  "Black Market",
];

export const TIERS = [2, 3, 4, 5, 6, 7, 8];
export const ENCHANTMENTS = [0, 1, 2, 3, 4];
export const QUALITIES = [1, 2, 3, 4, 5];

export const QUALITY_NAMES: Record<number, string> = {
  1: "Normal",
  2: "Good",
  3: "Outstanding",
  4: "Excellent",
  5: "Masterpiece",
};

export const CITY_COLORS: Record<string, string> = {
  Caerleon: "#E74C3C",
  Bridgewatch: "#E67E22",
  Martlock: "#3498DB",
  Thetford: "#2ECC71",
  "Fort Sterling": "#ECF0F1",
  Lymhurst: "#27AE60",
  Brecilien: "#9B59B6",
  "Black Market": "#2C3E50",
};

export interface StatsOverview {
  totalOpportunities: number;
  avgRoi: number;
  avgProfit: number;
  topCity: string;
  lastUpdated: string | null;
}
