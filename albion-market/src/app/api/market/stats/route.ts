// src/app/api/market/stats/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [countResult, avgResult, topCityResult, lastSync] = await Promise.all(
      [
        prisma.marketOrder.count({ where: { netProfit: { gt: BigInt(0) } } }),
        prisma.marketOrder.aggregate({
          where: { netProfit: { gt: BigInt(0) } },
          _avg: { roi: true },
        }),
        prisma.marketOrder.groupBy({
          by: ["city"],
          where: { netProfit: { gt: BigInt(0) } },
          _count: { city: true },
          orderBy: { _count: { city: "desc" } },
          take: 1,
        }),
        prisma.syncLog.findFirst({
          where: { status: "success" },
          orderBy: { createdAt: "desc" },
        }),
      ]
    );

    const avgProfitResult = await prisma.marketOrder.findMany({
      where: { netProfit: { gt: BigInt(0) } },
      select: { netProfit: true },
      take: 1000,
      orderBy: { roi: "desc" },
    });

    const avgProfit =
      avgProfitResult.length > 0
        ? avgProfitResult.reduce((sum, r) => sum + Number(r.netProfit), 0) /
          avgProfitResult.length
        : 0;

    return NextResponse.json({
      totalOpportunities: countResult,
      avgRoi: avgResult._avg.roi ?? 0,
      avgProfit: Math.round(avgProfit),
      topCity: topCityResult[0]?.city ?? "N/A",
      lastUpdated: lastSync?.createdAt.toISOString() ?? null,
    });
  } catch (error) {
    console.error("[API /market/stats]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
