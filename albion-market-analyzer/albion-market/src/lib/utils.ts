// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(2)}B`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return value.toLocaleString("en-US");
}

export function formatRoi(value: number): string {
  return `${value.toFixed(2)}%`;
}

export function formatNumber(value: number): string {
  return value.toLocaleString("en-US");
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(date));
}

export function timeAgo(date: string | Date): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);

  if (diffSec < 60) return `${diffSec}s atrás`;
  if (diffMin < 60) return `${diffMin}m atrás`;
  if (diffHour < 24) return `${diffHour}h atrás`;
  return formatDate(date);
}

export function getRoiColor(roi: number): string {
  if (roi >= 50) return "text-profit";
  if (roi >= 20) return "text-green-400";
  if (roi >= 10) return "text-yellow-400";
  if (roi >= 0) return "text-orange-400";
  return "text-loss";
}

export function getProfitColor(profit: number): string {
  if (profit > 0) return "text-profit";
  return "text-loss";
}

export function getTierColor(tier: number): string {
  const colors: Record<number, string> = {
    2: "#8B8B8B",
    3: "#4CAF50",
    4: "#2196F3",
    5: "#9C27B0",
    6: "#FF9800",
    7: "#F44336",
    8: "#FFD700",
  };
  return colors[tier] ?? "#8B8B8B";
}

export function getEnchantmentColor(enchantment: number): string {
  const colors: Record<number, string> = {
    0: "#8B8B8B",
    1: "#4CAF50",
    2: "#2196F3",
    3: "#9C27B0",
    4: "#FFD700",
  };
  return colors[enchantment] ?? "#8B8B8B";
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
