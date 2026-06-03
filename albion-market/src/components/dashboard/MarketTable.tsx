// src/components/dashboard/MarketTable.tsx
"use client";

import { useState, useEffect } from "react";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Loader2,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  ExternalLink,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMarketData, useSyncMarket } from "@/hooks/useMarketData";
import { useAppStore } from "@/store";
import { useSound } from "@/hooks/useSound";
import { toast } from "@/hooks/use-toast";
import {
  formatCurrency,
  formatRoi,
  getRoiColor,
  getProfitColor,
  getTierColor,
  getEnchantmentColor,
  timeAgo,
  cn,
} from "@/lib/utils";
import { getItemImageUrl, QUALITY_NAMES } from "@/lib/api/items";
import type { FlipOpportunity } from "@/types";
import { CITY_COLORS } from "@/types";

type SortField = keyof FlipOpportunity;
type SortDir = "asc" | "desc";

export function MarketTable() {
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>("roi");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const { data, isLoading, error, refetch } = useMarketData(page, 50);
  const { triggerSync } = useSyncMarket();
  const { syncStatus } = useAppStore();
  const { playAlert, playSuccess } = useSound();

  const prevItemsRef = useState<Set<string>>(new Set())[0];

  // Alert on new high ROI items
  useEffect(() => {
    if (!data?.items) return;
    data.items.forEach((item) => {
      if (item.roi >= 30 && !prevItemsRef.has(item.id)) {
        playAlert();
        toast({
          title: "🔥 Alta oportunidade detectada!",
          description: `${item.itemName} — ROI ${formatRoi(item.roi)} em ${item.city}`,
          variant: "profit",
        });
      }
      prevItemsRef.add(item.id);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.items]);

  const handleSync = async () => {
    try {
      const result = await triggerSync();
      if (result.success) {
        playSuccess();
        toast({
          title: "✅ Sincronização concluída",
          description: `${result.itemsCount} itens atualizados em ${(result.duration / 1000).toFixed(1)}s`,
          variant: "profit",
        });
        refetch();
      }
    } catch {
      toast({
        title: "Erro na sincronização",
        description: "Não foi possível atualizar os dados",
        variant: "destructive",
      });
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const sortedItems = data?.items
    ? [...data.items].sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        const mult = sortDir === "asc" ? 1 : -1;
        if (typeof aVal === "number" && typeof bVal === "number") {
          return (aVal - bVal) * mult;
        }
        return String(aVal).localeCompare(String(bVal)) * mult;
      })
    : [];

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field)
      return <ArrowUpDown className="ml-1 h-3 w-3 opacity-40" />;
    return sortDir === "asc" ? (
      <ArrowUp className="ml-1 h-3 w-3 text-profit" />
    ) : (
      <ArrowDown className="ml-1 h-3 w-3 text-profit" />
    );
  };

  const ColHeader = ({
    field,
    label,
    className,
  }: {
    field: SortField;
    label: string;
    className?: string;
  }) => (
    <th
      className={cn(
        "px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors font-mono",
        className
      )}
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center">
        {label}
        <SortIcon field={field} />
      </div>
    </th>
  );

  const totalPages = data ? Math.ceil(data.total / 50) : 0;

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-5 w-5 text-profit" />
          <div>
            <h2 className="font-display text-lg font-bold tracking-wide">
              Oportunidades de Flip
            </h2>
            <p className="text-xs text-muted-foreground font-mono">
              {data?.total ?? 0} resultados
              {data?.lastUpdated && ` · ${timeAgo(data.lastUpdated)}`}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSync}
          disabled={syncStatus.status === "syncing"}
          className="border-white/10 bg-black/30 hover:bg-white/5"
        >
          <RefreshCw
            className={cn(
              "mr-2 h-4 w-4",
              syncStatus.status === "syncing" && "animate-spin"
            )}
          />
          {syncStatus.status === "syncing" ? "Sincronizando..." : "Sincronizar"}
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-white/5 bg-black/40 backdrop-blur-sm overflow-hidden">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-profit" />
          </div>
        ) : error ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 text-muted-foreground">
            <AlertTriangle className="h-8 w-8 text-loss" />
            <p className="text-sm">Erro ao carregar dados</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Tentar novamente
            </Button>
          </div>
        ) : sortedItems.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 text-muted-foreground">
            <AlertTriangle className="h-8 w-8" />
            <p className="text-sm">Nenhuma oportunidade encontrada</p>
            <p className="text-xs">Tente sincronizar os dados ou ajustar os filtros</p>
            <Button variant="profit" size="sm" onClick={handleSync}>
              Sincronizar agora
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-muted-foreground font-mono w-12">
                    #
                  </th>
                  <ColHeader field="itemName" label="Item" className="min-w-[200px]" />
                  <ColHeader field="city" label="Cidade" />
                  <ColHeader field="buyPrice" label="Compra" />
                  <ColHeader field="sellPrice" label="Venda" />
                  <ColHeader field="grossProfit" label="L. Bruto" />
                  <ColHeader field="netProfit" label="L. Líquido" />
                  <ColHeader field="roi" label="ROI" />
                </tr>
              </thead>
              <tbody>
                {sortedItems.map((item, index) => (
                  <MarketRow
                    key={item.id}
                    item={item}
                    rank={(page - 1) * 50 + index + 1}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground font-mono">
            Página {page} de {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="border-white/10 bg-black/30"
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="border-white/10 bg-black/30"
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function MarketRow({
  item,
  rank,
}: {
  item: FlipOpportunity;
  rank: number;
}) {
  const isHighRoi = item.roi >= 30;
  const enchStr =
    item.enchantment > 0 ? (
      <span
        className="text-xs font-bold ml-0.5"
        style={{ color: getEnchantmentColor(item.enchantment) }}
      >
        .{item.enchantment}
      </span>
    ) : null;

  return (
    <tr
      className={cn(
        "border-b border-white/[0.03] transition-colors hover:bg-white/[0.03] group",
        isHighRoi && "bg-profit/[0.03]"
      )}
    >
      {/* Rank */}
      <td className="px-4 py-3">
        <span className="text-xs text-muted-foreground font-mono">{rank}</span>
      </td>

      {/* Item */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-md border border-white/10 bg-white/5">
            <Image
              src={getItemImageUrl(item.itemId, item.quality)}
              alt={item.itemName}
              fill
              className="object-contain p-0.5"
              unoptimized
            />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span
                className="text-xs font-bold font-mono"
                style={{ color: getTierColor(item.tier) }}
              >
                T{item.tier}
              </span>
              {enchStr}
              <span className="text-sm font-medium text-foreground leading-tight">
                {item.itemName.replace(/^T\d(\.\d)?\s/, "")}
              </span>
              {isHighRoi && (
                <span className="text-xs text-profit animate-pulse">🔥</span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Badge variant="outline" className="h-4 px-1 text-[10px] border-white/10">
                {QUALITY_NAMES[item.quality] ?? "Normal"}
              </Badge>
            </div>
          </div>
        </div>
      </td>

      {/* City */}
      <td className="px-4 py-3">
        <span
          className="text-xs font-semibold font-mono px-2 py-0.5 rounded-full"
          style={{
            color: CITY_COLORS[item.city] ?? "#fff",
            backgroundColor: `${CITY_COLORS[item.city] ?? "#fff"}15`,
          }}
        >
          {item.city}
        </span>
      </td>

      {/* Buy price */}
      <td className="px-4 py-3">
        <span className="text-sm font-mono text-muted-foreground">
          {formatCurrency(item.buyPrice)}
        </span>
      </td>

      {/* Sell price */}
      <td className="px-4 py-3">
        <span className="text-sm font-mono">
          {formatCurrency(item.sellPrice)}
        </span>
      </td>

      {/* Gross profit */}
      <td className="px-4 py-3">
        <span
          className={cn("text-sm font-mono font-medium", getProfitColor(item.grossProfit))}
        >
          {formatCurrency(item.grossProfit)}
        </span>
      </td>

      {/* Net profit */}
      <td className="px-4 py-3">
        <span
          className={cn(
            "text-sm font-mono font-bold",
            getProfitColor(item.netProfit)
          )}
        >
          {formatCurrency(item.netProfit)}
        </span>
      </td>

      {/* ROI */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="relative h-1 w-16 overflow-hidden rounded-full bg-white/10">
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-all"
              style={{
                width: `${Math.min(100, item.roi)}%`,
                backgroundColor:
                  item.roi >= 30
                    ? "#00D4AA"
                    : item.roi >= 15
                    ? "#F0B429"
                    : "#FF4757",
              }}
            />
          </div>
          <span
            className={cn(
              "text-sm font-bold font-mono",
              getRoiColor(item.roi)
            )}
          >
            {formatRoi(item.roi)}
          </span>
        </div>
      </td>
    </tr>
  );
}
