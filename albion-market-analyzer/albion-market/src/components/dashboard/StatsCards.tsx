// src/components/dashboard/StatsCards.tsx
"use client";

import { TrendingUp, DollarSign, BarChart3, MapPin, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useStatsOverview } from "@/hooks/useMarketData";
import { formatCurrency, formatRoi, timeAgo } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
  glowColor: string;
}

function StatCard({ title, value, subtitle, icon, color, glowColor }: StatCardProps) {
  return (
    <Card className={`relative overflow-hidden border-white/5 bg-black/40 backdrop-blur-sm`}>
      <div
        className="absolute inset-0 opacity-5"
        style={{
          background: `radial-gradient(circle at top right, ${glowColor}, transparent 70%)`,
        }}
      />
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest font-mono">
              {title}
            </p>
            <p className={`text-2xl font-bold font-display tracking-wide`} style={{ color }}>
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${glowColor}20`, color }}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function StatsCards() {
  const { data, isLoading } = useStatsOverview();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-white/5 bg-black/40">
            <CardContent className="p-5">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Carregando...</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: "Oportunidades",
      value: data?.totalOpportunities.toLocaleString() ?? "0",
      subtitle: "flips identificados",
      icon: <BarChart3 className="h-5 w-5" />,
      color: "#00D4AA",
      glowColor: "#00D4AA",
    },
    {
      title: "ROI Médio",
      value: formatRoi(data?.avgRoi ?? 0),
      subtitle: "retorno médio",
      icon: <TrendingUp className="h-5 w-5" />,
      color: "#F0B429",
      glowColor: "#F0B429",
    },
    {
      title: "Lucro Médio",
      value: formatCurrency(data?.avgProfit ?? 0),
      subtitle: "por operação",
      icon: <DollarSign className="h-5 w-5" />,
      color: "#00D4AA",
      glowColor: "#00D4AA",
    },
    {
      title: "Melhor Cidade",
      value: data?.topCity ?? "N/A",
      subtitle: data?.lastUpdated ? `sync ${timeAgo(data.lastUpdated)}` : "sem dados",
      icon: <MapPin className="h-5 w-5" />,
      color: "#9B59B6",
      glowColor: "#9B59B6",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  );
}
