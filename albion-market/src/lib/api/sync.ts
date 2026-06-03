// src/lib/api/sync.ts
import prisma from "@/lib/db/prisma";
import { fetchAllMarketData, calculateProfit } from "./albion";
import { parseItemId, formatItemName } from "./items";
import type { AlbionMarketData } from "@/types";

const DEFAULT_MARKET_FEE = 0.025;
const DEFAULT_PREMIUM_FEE = 0.0;

export async function syncMarketData(): Promise<{
  success: boolean;
  itemsCount: number;
  duration: number;
  error?: string;
}> {
  const startTime = Date.now();

  try {
    console.log("[Sync] Starting market data sync...");

    const rawData = await fetchAllMarketData();
    console.log(`[Sync] Fetched ${rawData.length} raw market entries`);

    const opportunities = processMarketData(rawData);
    console.log(`[Sync] Processed ${opportunities.length} flip opportunities`);

    if (opportunities.length === 0) {
      await prisma.syncLog.create({
        data: {
          status: "warning",
          itemsCount: 0,
          duration: Date.now() - startTime,
          error: "No opportunities found",
        },
      });
      return { success: true, itemsCount: 0, duration: Date.now() - startTime };
    }

    // Upsert all opportunities
    const batchSize = 50;
    let upsertCount = 0;

    for (let i = 0; i < opportunities.length; i += batchSize) {
      const batch = opportunities.slice(i, i + batchSize);

      await Promise.all(
        batch.map((op) =>
          prisma.marketOrder.upsert({
            where: { id: op.id },
            create: {
              id: op.id,
              itemId: op.itemId,
              itemName: op.itemName,
              tier: op.tier,
              enchantment: op.enchantment,
              city: op.city,
              quality: op.quality,
              buyPrice: BigInt(op.buyPrice),
              sellPrice: BigInt(op.sellPrice),
              buyVolume: op.buyVolume,
              sellVolume: op.sellVolume,
              grossProfit: BigInt(op.grossProfit),
              netProfit: BigInt(op.netProfit),
              roi: op.roi,
              marketFee: DEFAULT_MARKET_FEE,
            },
            update: {
              itemName: op.itemName,
              tier: op.tier,
              enchantment: op.enchantment,
              city: op.city,
              quality: op.quality,
              buyPrice: BigInt(op.buyPrice),
              sellPrice: BigInt(op.sellPrice),
              buyVolume: op.buyVolume,
              sellVolume: op.sellVolume,
              grossProfit: BigInt(op.grossProfit),
              netProfit: BigInt(op.netProfit),
              roi: op.roi,
              marketFee: DEFAULT_MARKET_FEE,
              updatedAt: new Date(),
            },
          })
        )
      );
      upsertCount += batch.length;
    }

    const duration = Date.now() - startTime;

    await prisma.syncLog.create({
      data: {
        status: "success",
        itemsCount: upsertCount,
        duration,
      },
    });

    console.log(`[Sync] Complete. ${upsertCount} items in ${duration}ms`);
    return { success: true, itemsCount: upsertCount, duration };
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMsg = error instanceof Error ? error.message : "Unknown error";

    console.error("[Sync] Error:", errorMsg);

    await prisma.syncLog.create({
      data: {
        status: "error",
        itemsCount: 0,
        duration,
        error: errorMsg,
      },
    });

    return { success: false, itemsCount: 0, duration, error: errorMsg };
  }
}

interface ProcessedOpportunity {
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
}

function processMarketData(
  rawData: AlbionMarketData[]
): ProcessedOpportunity[] {
  const opportunities: ProcessedOpportunity[] = [];

  for (const entry of rawData) {
    // Skip entries with zero prices
    if (entry.sell_price_min <= 0 || entry.buy_price_max <= 0) continue;
    // Skip if sell price is lower than buy (no opportunity)
    if (entry.sell_price_min <= entry.buy_price_max) continue;

    const { tier, enchantment, baseName } = parseItemId(entry.item_id);
    const { grossProfit, netProfit, roi } = calculateProfit(
      entry.buy_price_max,
      entry.sell_price_min,
      DEFAULT_MARKET_FEE,
      DEFAULT_PREMIUM_FEE
    );

    // Only include profitable opportunities
    if (netProfit <= 0) continue;

    const id = `${entry.item_id}_${entry.city}_${entry.quality}`;

    opportunities.push({
      id,
      itemId: entry.item_id,
      itemName: formatItemName(entry.item_id),
      tier,
      enchantment,
      city: entry.city,
      quality: entry.quality,
      buyPrice: entry.buy_price_max,
      sellPrice: entry.sell_price_min,
      buyVolume: entry.sell_price_max, // Using max price as proxy for volume indication
      sellVolume: entry.sell_price_min,
      grossProfit,
      netProfit,
      roi,
    });
  }

  return opportunities;
}
