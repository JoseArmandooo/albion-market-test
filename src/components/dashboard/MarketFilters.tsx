// src/components/dashboard/MarketFilters.tsx
"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/store";
import { CITIES, TIERS, ENCHANTMENTS, QUALITIES, QUALITY_NAMES } from "@/types";
import { debounce } from "@/lib/utils";
import { useCallback } from "react";

export function MarketFilters() {
  const { filters, setFilters, resetFilters } = useAppStore();

  const hasActiveFilters =
    filters.city ||
    filters.tier != null ||
    filters.enchantment != null ||
    (filters.minRoi && filters.minRoi > 0) ||
    (filters.minProfit && filters.minProfit > 0) ||
    filters.search;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((value: unknown) => {
      setFilters({ search: value as string });
    }, 400),
    []
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium font-display tracking-wide text-muted-foreground uppercase">
          Filtros
        </span>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="ml-auto h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="mr-1 h-3 w-3" />
            Limpar
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {/* Search */}
        <div className="relative col-span-2 sm:col-span-3 lg:col-span-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar item..."
            className="pl-9 border-white/10 bg-black/30 placeholder:text-muted-foreground/50"
            defaultValue={filters.search ?? ""}
            onChange={(e) => debouncedSearch(e.target.value)}
          />
        </div>

        {/* City */}
        <Select
          value={filters.city ?? "all"}
          onValueChange={(v) =>
            setFilters({ city: v === "all" ? undefined : v })
          }
        >
          <SelectTrigger className="border-white/10 bg-black/30">
            <SelectValue placeholder="Cidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas cidades</SelectItem>
            {CITIES.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Tier */}
        <Select
          value={filters.tier != null ? String(filters.tier) : "all"}
          onValueChange={(v) =>
            setFilters({ tier: v === "all" ? null : parseInt(v) })
          }
        >
          <SelectTrigger className="border-white/10 bg-black/30">
            <SelectValue placeholder="Tier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos tiers</SelectItem>
            {TIERS.map((tier) => (
              <SelectItem key={tier} value={String(tier)}>
                T{tier}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Enchantment */}
        <Select
          value={
            filters.enchantment != null ? String(filters.enchantment) : "all"
          }
          onValueChange={(v) =>
            setFilters({ enchantment: v === "all" ? null : parseInt(v) })
          }
        >
          <SelectTrigger className="border-white/10 bg-black/30">
            <SelectValue placeholder="Encant." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos encant.</SelectItem>
            {ENCHANTMENTS.map((e) => (
              <SelectItem key={e} value={String(e)}>
                {e === 0 ? "Sem encant." : `+${e}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Quality */}
        <Select
          value={filters.quality != null ? String(filters.quality) : "all"}
          onValueChange={(v) =>
            setFilters({ quality: v === "all" ? null : parseInt(v) })
          }
        >
          <SelectTrigger className="border-white/10 bg-black/30">
            <SelectValue placeholder="Qualidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas qualid.</SelectItem>
            {QUALITIES.map((q) => (
              <SelectItem key={q} value={String(q)}>
                {QUALITY_NAMES[q]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ROI and Profit sliders row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground font-mono">
            ROI mínimo:{" "}
            <span className="text-profit font-bold">{filters.minRoi ?? 0}%</span>
          </label>
          <Input
            type="range"
            min="0"
            max="200"
            step="5"
            value={filters.minRoi ?? 0}
            onChange={(e) => setFilters({ minRoi: parseInt(e.target.value) })}
            className="h-2 cursor-pointer accent-[#00D4AA] bg-transparent border-0 p-0"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground font-mono">
            Lucro mínimo:{" "}
            <span className="text-gold font-bold">
              {((filters.minProfit ?? 0) / 1000).toFixed(0)}K
            </span>
          </label>
          <Input
            type="range"
            min="0"
            max="5000000"
            step="10000"
            value={filters.minProfit ?? 0}
            onChange={(e) => setFilters({ minProfit: parseInt(e.target.value) })}
            className="h-2 cursor-pointer accent-[#F0B429] bg-transparent border-0 p-0"
          />
        </div>
      </div>
    </div>
  );
}
