// src/components/dashboard/Rankings.tsx
"use client";

import { Trophy, TrendingUp, DollarSign, Loader2, Crown } from "lucide-react";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useRankings } from "@/hooks/useMarketData";
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

function RankBadge({ rank }: { rank: number }) {
  if (rank <= 3) {
    return (
      <div
        className="flex h-7 w-7 items-center justify-center rounded-full font-bold text-sm font-display"
        style={{
          backgroundColor: `${RANK_COLORS[rank - 1]}20`,
          color: RANK_COLORS[rank - 1],
          border: `1px solid ${RANK_COLORS[rank - 1]}40`,
        }}
      >
        {rank === 1 ? <Crown className="h-3.5 w-3.5" /> : rank}
      </div>
    );
  }
  return (
    <span className="flex h-7 w-7 items-center justify-center text-xs text-muted-foreground font-mono">
      {rank}
    </span>
  );
}

function RankingRow({ item, showRoi = true }: { item: RankingItem; showRoi?: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border border-white/[0.03] bg-white/[0.02] px-3 py-2.5 transition-colors hover:bg-white/[0.05]",
        item.rank <= 3 && "border-gold/10 bg-gold/[0.03]"
      )}
    >
      <RankBadge rank={item.rank} />

      <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-md border border-white/10 bg-white/5">
        <Image
          src={getItemImageUrl(item.itemId, item.quality)}
          alt={item.itemName}
          fill
          className="object-contain p-0.5"
          unoptimized
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span
            className="text-xs font-bold font-mono shrink-0"
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
          <span className="text-sm font-medium truncate">
            {item.itemName.replace(/^T\d(\.\d)?\s/, "")}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span
            className="text-xs font-mono"
            style={{
              color: CITY_COLORS[item.city] ?? "#fff",
            }}
          >
            {item.city}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatCurrency(item.buyPrice)} → {formatCurrency(item.sellPrice)}
          </span>
        </div>
      </div>

      <div className="text-right shrink-0">
        <div className={cn("text-sm font-bold font-mono", showRoi ? getRoiColor(item.roi) : "text-profit")}>
          {showRoi ? formatRoi(item.roi) : formatCurrency(item.netProfit)}
        </div>
        <div className="text-xs text-muted-foreground font-mono">
          {showRoi ? formatCurrency(item.netProfit) : formatRoi(item.roi)}
        </div>
      </div>
    </div>
  );
}

function RankingList({
  items,
  showRoi = true,
  isLoading,
}: {
  items: RankingItem[];
  showRoi?: boolean;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-profit" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
        Nenhum dado disponível. Sincronize primeiro.
      </div>
    );
  }

  return (
    <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1 scrollbar-thin">
      {items.map((item) => (
        <RankingRow key={`${item.id}-${item.rank}`} item={item} showRoi={showRoi} />
      ))}
    </div>
  );
}

export function Rankings() {
  const { data, isLoading } = useRankings();

  return (
    <div className="rounded-xl border border-white/5 bg-black/40 backdrop-blur-sm p-5">
      <div className="flex items-center gap-3 mb-5">
        <Trophy className="h-5 w-5 text-gold" />
        <div>
          <h2 className="font-display text-lg font-bold tracking-wide">Rankings</h2>
          <p className="text-xs text-muted-foreground font-mono">Top 50 oportunidades</p>
        </div>
      </div>

      <Tabs defaultValue="flips">
        <TabsList className="bg-white/5 border border-white/5 w-full">
          <TabsTrigger
            value="flips"
            className="flex-1 data-[state=active]:bg-white/10"
          >
            <Trophy className="mr-1.5 h-3.5 w-3.5" />
            Melhores Flips
          </TabsTrigger>
          <TabsTrigger
            value="roi"
            className="flex-1 data-[state=active]:bg-white/10"
          >
            <TrendingUp className="mr-1.5 h-3.5 w-3.5" />
            Maior ROI
          </TabsTrigger>
          <TabsTrigger
            value="profit"
            className="flex-1 data-[state=active]:bg-white/10"
          >
            <DollarSign className="mr-1.5 h-3.5 w-3.5" />
            Maior Lucro
          </TabsTrigger>
        </TabsList>

        <TabsContent value="flips" className="mt-4">
          <RankingList
            items={data?.topFlips ?? []}
            showRoi
            isLoading={isLoading}
          />
        </TabsContent>
        <TabsContent value="roi" className="mt-4">
          <RankingList
            items={data?.topRoi ?? []}
            showRoi
            isLoading={isLoading}
          />
        </TabsContent>
        <TabsContent value="profit" className="mt-4">
          <RankingList
            items={data?.topProfit ?? []}
            showRoi={false}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
