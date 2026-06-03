// src/lib/api/albion.ts
import type { AlbionMarketData } from "@/types";
import { CITIES } from "@/types";
import { TRADEABLE_ITEMS } from "./items";

const API_BASE = process.env.ALBION_API_BASE_URL ?? "https://west.albion-online-data.com/api/v2";
const BATCH_SIZE = 100; // API supports up to 100 items per request
const REQUEST_DELAY = 500; // ms between batches to avoid rate limiting

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchMarketPrices(
  items: string[],
  cities: string[] = CITIES,
  qualities: number[] = [1, 2, 3]
): Promise<AlbionMarketData[]> {
  const allData: AlbionMarketData[] = [];
  const batches = chunkArray(items, BATCH_SIZE);

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    const itemsParam = batch.join(",");
    const locationsParam = cities.join(",");
    const qualitiesParam = qualities.join(",");

    const url = `${API_BASE}/stats/prices/${itemsParam}?locations=${locationsParam}&qualities=${qualitiesParam}`;

    try {
      const response = await fetch(url, {
        next: { revalidate: 30 },
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        console.error(`API error: ${response.status} ${response.statusText}`);
        continue;
      }

      const data: AlbionMarketData[] = await response.json();
      allData.push(...data);
    } catch (error) {
      console.error(`Failed to fetch batch ${i + 1}:`, error);
    }

    if (i < batches.length - 1) {
      await sleep(REQUEST_DELAY);
    }
  }

  return allData;
}

export async function fetchAllMarketData(): Promise<AlbionMarketData[]> {
  return fetchMarketPrices(TRADEABLE_ITEMS, [...CITIES]);
}

export function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

export function calculateProfit(
  buyPrice: number,
  sellPrice: number,
  marketFee: number = 0.025,
  premiumFee: number = 0.0
): {
  grossProfit: number;
  netProfit: number;
  roi: number;
} {
  if (buyPrice <= 0 || sellPrice <= 0) {
    return { grossProfit: 0, netProfit: 0, roi: 0 };
  }

  const grossProfit = sellPrice - buyPrice;
  const sellFee = sellPrice * (marketFee + premiumFee);
  const netProfit = grossProfit - sellFee;
  const roi = buyPrice > 0 ? (netProfit / buyPrice) * 100 : 0;

  return {
    grossProfit: Math.round(grossProfit),
    netProfit: Math.round(netProfit),
    roi: Math.round(roi * 100) / 100,
  };
}
