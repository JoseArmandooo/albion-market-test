// src/app/api/market/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import type { MarketResponse } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(100, parseInt(searchParams.get("limit") ?? "50"));
    const skip = (page - 1) * limit;

    const city = searchParams.get("city") ?? undefined;
    const tier = searchParams.get("tier")
      ? parseInt(searchParams.get("tier")!)
      : undefined;
    const enchantment = searchParams.get("enchantment")
      ? parseInt(searchParams.get("enchantment")!)
      : undefined;
    const minRoi = searchParams.get("minRoi")
      ? parseFloat(searchParams.get("minRoi")!)
      : undefined;
    const minProfit = searchParams.get("minProfit")
      ? parseInt(searchParams.get("minProfit")!)
      : undefined;
    const quality = searchParams.get("quality")
      ? parseInt(searchParams.get("quality")!)
      : undefined;
    const search = searchParams.get("search") ?? undefined;

    const where = {
      ...(city && { city }),
      ...(tier !== undefined && { tier }),
      ...(enchantment !== undefined && { enchantment }),
      ...(minRoi !== undefined && { roi: { gte: minRoi } }),
      ...(minProfit !== undefined && {
        netProfit: { gte: BigInt(minProfit) },
      }),
      ...(quality !== undefined && { quality }),
      ...(search && {
        itemName: { contains: search, mode: "insensitive" as const },
      }),
      netProfit: {
        gt: BigInt(0),
        ...(minProfit !== undefined && { gte: BigInt(minProfit) }),
      },
    };

    const [items, total] = await Promise.all([
      prisma.marketOrder.findMany({
        where,
        orderBy: { roi: "desc" },
        skip,
        take: limit,
      }),
      prisma.marketOrder.count({ where }),
    ]);

    const lastSyncLog = await prisma.syncLog.findFirst({
      where: { status: "success" },
      orderBy: { createdAt: "desc" },
    });

    const serialized: MarketResponse = {
      items: items.map((item) => ({
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
      })),
      total,
      page,
      limit,
      lastUpdated: lastSyncLog?.createdAt.toISOString() ?? null,
    };

    return NextResponse.json(serialized);
  } catch (error) {
    console.error("[API /market]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
