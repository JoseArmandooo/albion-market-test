// src/app/rankings/page.tsx
"use client";

import { Trophy, TrendingUp, DollarSign, Crown, Loader2 } from "lucide-react";
import Image from "next/image";
import { useRankings } from "@/hooks/useMarketData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  formatCurrency,
  formatRoi,
  getRoiColor,
  getTierColor,
  getEnchantmentColor,
  cn,
} from "@/lib/utils";
import { getItemImageUrl } from "@/lib/api/items";
import { CITY_COLORS } from "@/types";
import type { RankingItem } from "@/types";

const RANK_COLORS = ["#FFD700", "#C0C0C0", "#CD7F32"];
const MEDAL_EMOJIS = ["🥇", "🥈", "🥉"];

function PodiumCard({ item }: { item: RankingItem }) {
  return (
    <Card
      className="relative overflow-hidden border-white/5 bg-black/40"
      style={{
        borderColor:
          item.rank <= 3 ? `${RANK_COLORS[item.rank - 1]}30` : undefined,
      }}
    >
      {item.rank <= 3 && (
        <div
          className="absolute inset-0 opacity-5"
          style={{
            background: `radial-gradient(circle at top right, ${RANK_COLORS[item.rank - 1]}, transparent 70%)`,
          }}
        />
      )}
      <CardContent className="p-4 relative">
        <div className="flex items-start gap-3">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold"
            style={
              item.rank <= 3
                ? {
                    backgroundColor: `${RANK_COLORS[item.rank - 1]}20`,
                    color: RANK_COLORS[item.rank - 1],
                    border: `1px solid ${RANK_COLORS[item.rank - 1]}40`,
                  }
                : { backgroundColor: "rgba(255,255,255,0.05)", color: "#666" }
            }
          >
            {item.rank <= 3 ? (
              item.rank === 1 ? (
                <Crown className="h-4 w-4" />
              ) : (
                item.rank
              )
            ) : (
              item.rank
            )}
          </div>

          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-white/10">
            <Image
              src={getItemImageUrl(item.itemId, item.quality)}
              alt={item.itemName}
              fill
              className="object-contain p-0.5"
              unoptimized
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 flex-wrap">
              <span
                className="text-xs font-bold font-mono"
                style={{ color: getTierColor(item.tier) }}
              >
                T{item.tier}
              </span>
              {item.enchantment > 0 && (
                <span
                  className="text-xs font-bold"
                  style={{ color: getEnchantmentColor(item.enchantment) }}
                >
                  .{item.enchantment}
                </span>
              )}
              <span className="text-sm font-semibold font-display truncate">
                {item.itemName.replace(/^T\d(\.\d)?\s/, "")}
              </span>
              {item.rank <= 3 && (
                <span className="text-base">{MEDAL_EMOJIS[item.rank - 1]}</span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span
                className="text-xs font-mono px-1.5 py-0.5 rounded-full"
                style={{
                  color: CITY_COLORS[item.city] ?? "#fff",
                  backgroundColor: `${CITY_COLORS[item.city] ?? "#fff"}15`,
                }}
              >
                {item.city}
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                {formatCurrency(item.buyPrice)} → {formatCurrency(item.sellPrice)}
              </span>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className={cn("text-base font-bold font-mono", getRoiColor(item.roi))}>
              {formatRoi(item.roi)}
            </div>
            <div className="text-xs text-profit font-mono">
              {formatCurrency(item.netProfit)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RankingSection({
  title,
  icon,
  items,
  isLoading,
  valueLabel,
  getValue,
}: {
  title: string;
  icon: React.ReactNode;
  items: RankingItem[];
  isLoading: boolean;
  valueLabel: string;
  getValue: (item: RankingItem) => string;
}) {
  return (
    <Card className="border-white/5 bg-black/30 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          {icon}
          {title}
          <Badge variant="outline" className="ml-auto text-xs border-white/10">
            Top 50
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-profit" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
            Sem dados. Sincronize primeiro.
          </div>
        ) : (
          <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1">
            {items.map((item) => (
              <PodiumCard key={`${item.id}-${item.rank}`} item={item} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function RankingsPage() {
  const { data, isLoading } = useRankings();

  return (
    <div className="container mx-auto px-4 py-6 max-w-[1600px]">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold tracking-wide gradient-text">
          Rankings
        </h1>
        <p className="text-muted-foreground mt-1">
          As melhores oportunidades de flip do mercado
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <RankingSection
          title="Melhores Flips"
          icon={<Trophy className="h-5 w-5 text-gold" />}
          items={data?.topFlips ?? []}
          isLoading={isLoading}
          valueLabel="ROI"
          getValue={(item) => formatRoi(item.roi)}
        />
        <RankingSection
          title="Maior ROI"
          icon={<TrendingUp className="h-5 w-5 text-profit" />}
          items={data?.topRoi ?? []}
          isLoading={isLoading}
          valueLabel="ROI"
          getValue={(item) => formatRoi(item.roi)}
        />
        <RankingSection
          title="Maior Lucro"
          icon={<DollarSign className="h-5 w-5 text-blue-400" />}
          items={data?.topProfit ?? []}
          isLoading={isLoading}
          valueLabel="Lucro"
          getValue={(item) => formatCurrency(item.netProfit)}
        />
      </div>
    </div>
  );
}
