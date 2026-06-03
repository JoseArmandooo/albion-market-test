// src/app/api/alerts/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const alerts = await prisma.alert.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      alerts.map((a) => ({
        ...a,
        triggeredAt: a.triggeredAt?.toISOString() ?? null,
        createdAt: a.createdAt.toISOString(),
        updatedAt: a.updatedAt.toISOString(),
      }))
    );
  } catch (error) {
    console.error("[API /alerts GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const alert = await prisma.alert.create({
      data: {
        itemId: body.itemId,
        itemName: body.itemName,
        city: body.city,
        alertType: body.alertType,
        threshold: body.threshold,
      },
    });

    return NextResponse.json({
      ...alert,
      triggeredAt: alert.triggeredAt?.toISOString() ?? null,
      createdAt: alert.createdAt.toISOString(),
      updatedAt: alert.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("[API /alerts POST]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    await prisma.alert.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API /alerts DELETE]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
