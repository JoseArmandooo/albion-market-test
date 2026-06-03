// src/app/api/market/sync/route.ts
import { NextResponse } from "next/server";
import { syncMarketData } from "@/lib/api/sync";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 minutes for Vercel

export async function POST() {
  try {
    const result = await syncMarketData();
    return NextResponse.json(result);
  } catch (error) {
    console.error("[API /market/sync]", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const result = await syncMarketData();
    return NextResponse.json(result);
  } catch (error) {
    console.error("[API /market/sync GET]", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
