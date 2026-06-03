// src/app/api/rankings/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import type { RankingResponse } from "@/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const positiveProfit = { netProfit: { gt: BigInt(0) } };

    const [topFlipsRaw, topRoiRaw, topProfitRaw] = await Promise.all([
      // Top 50 best overall flips (balanced score of ROI + profit)
      prisma.marketOrder.findMany({
        where: positiveProfit,
        orderBy: [{ roi: "desc" }, { netProfit: "desc" }],
        take: 50,
      }),
      // Top 50 by ROI
      prisma.marketOrder.findMany({
        where: positiveProfit,
        orderBy: { roi: "desc" },
        take: 50,
      }),
      // Top 50 by absolute profit
      prisma.marketOrder.findMany({
        where: positiveProfit,
        orderBy: { netProfit: "desc" },
        take: 50,
      }),
    ]);

    const serialize = (items: typeof topFlipsRaw) =>
      items.map((item, index) => ({
        rank: index + 1,
        id: item.id,
        itemId: item.itemId,
        itemName: item.itemName,
        tier: item.tier,
        enchantment: item.enchantment,
        city: item.city,
        quality: item.quality,
        buyPrice: Number(item.buyPrice),
        sellPrice: Number(item.sellPrice),
        buyVolume: item.buyVolume,
        sellVolume: item.sellVolume,
        grossProfit: Number(item.grossProfit),
        netProfit: Number(item.netProfit),
        roi: item.roi,
        marketFee: item.marketFee,
        updatedAt: item.updatedAt.toISOString(),
      }));

    const response: RankingResponse = {
      topFlips: serialize(topFlipsRaw),
      topRoi: serialize(topRoiRaw),
      topProfit: serialize(topProfitRaw),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[API /rankings]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
