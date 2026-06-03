// src/components/dashboard/AlertsPanel.tsx
"use client";

import { useState } from "react";
import { Bell, Plus, Trash2, BellRing, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { CITIES } from "@/types";
import type { Alert } from "@/types";
import { formatDate } from "@/lib/utils";

async function fetchAlerts(): Promise<Alert[]> {
  const res = await fetch("/api/alerts");
  if (!res.ok) throw new Error("Failed to fetch alerts");
  return res.json();
}

async function createAlert(data: Omit<Alert, "id" | "triggered" | "createdAt" | "triggeredAt">): Promise<Alert> {
  const res = await fetch("/api/alerts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create alert");
  return res.json();
}

async function deleteAlert(id: string): Promise<void> {
  const res = await fetch(`/api/alerts?id=${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete alert");
}

const ALERT_TYPE_LABELS = {
  ROI: "ROI ≥",
  PROFIT: "Lucro ≥",
  PRICE_DROP: "Queda de preço",
  PRICE_SPIKE: "Subida de preço",
};

export function AlertsPanel() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    itemId: "",
    itemName: "",
    city: "Caerleon",
    alertType: "ROI" as Alert["alertType"],
    threshold: 20,
  });

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ["alerts"],
    queryFn: fetchAlerts,
    refetchInterval: 30_000,
  });

  const createMutation = useMutation({
    mutationFn: createAlert,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      setShowForm(false);
      toast({ title: "✅ Alerta criado", variant: "profit" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAlert,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      toast({ title: "Alerta removido" });
    },
  });

  const handleCreate = () => {
    if (!form.itemId || !form.itemName) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o ID e nome do item",
        variant: "destructive",
      });
      return;
    }
    createMutation.mutate(form);
  };

  const triggeredCount = alerts.filter((a) => a.triggered).length;

  return (
    <div className="rounded-xl border border-white/5 bg-black/40 backdrop-blur-sm p-5">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell className="h-5 w-5 text-gold" />
            {triggeredCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-loss text-[8px] text-white font-bold">
                {triggeredCount}
              </span>
            )}
          </div>
          <div>
            <h2 className="font-display text-lg font-bold tracking-wide">Alertas</h2>
            <p className="text-xs text-muted-foreground font-mono">
              {alerts.length} configurados
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowForm(!showForm)}
          className="border-white/10 bg-black/30"
        >
          <Plus className="h-4 w-4 mr-1" />
          Novo
        </Button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="mb-4 rounded-lg border border-white/10 bg-white/[0.03] p-4 space-y-3">
          <h4 className="text-sm font-semibold font-display">Criar alerta</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">ID do Item</Label>
              <Input
                placeholder="ex: T6_MAIN_SWORD@2"
                value={form.itemId}
                onChange={(e) => setForm({ ...form, itemId: e.target.value })}
                className="border-white/10 bg-black/30 text-xs font-mono"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Nome</Label>
              <Input
                placeholder="ex: Great Sword"
                value={form.itemName}
                onChange={(e) => setForm({ ...form, itemName: e.target.value })}
                className="border-white/10 bg-black/30 text-xs"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Cidade</Label>
              <Select
                value={form.city}
                onValueChange={(v) => setForm({ ...form, city: v })}
              >
                <SelectTrigger className="border-white/10 bg-black/30 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CITIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Tipo</Label>
              <Select
                value={form.alertType}
                onValueChange={(v) =>
                  setForm({ ...form, alertType: v as Alert["alertType"] })
                }
              >
                <SelectTrigger className="border-white/10 bg-black/30 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ALERT_TYPE_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">
              Threshold ({form.alertType === "ROI" ? "%" : "silver"})
            </Label>
            <Input
              type="number"
              value={form.threshold}
              onChange={(e) =>
                setForm({ ...form, threshold: parseFloat(e.target.value) })
              }
              className="border-white/10 bg-black/30 font-mono text-xs"
            />
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="profit"
              onClick={handleCreate}
              disabled={createMutation.isPending}
              className="flex-1"
            >
              {createMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Criar"
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowForm(false)}
              className="border-white/10"
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Alerts list */}
      {isLoading ? (
        <div className="flex h-32 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : alerts.length === 0 ? (
        <div className="flex h-32 flex-col items-center justify-center gap-2 text-muted-foreground">
          <Bell className="h-6 w-6" />
          <p className="text-sm">Nenhum alerta configurado</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`flex items-start justify-between rounded-lg border p-3 ${
                alert.triggered
                  ? "border-profit/20 bg-profit/[0.05]"
                  : "border-white/5 bg-white/[0.02]"
              }`}
            >
              <div className="flex items-start gap-2">
                {alert.triggered ? (
                  <BellRing className="h-4 w-4 text-profit shrink-0 mt-0.5" />
                ) : (
                  <Bell className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="text-sm font-medium font-display">{alert.itemName}</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {alert.city} · {ALERT_TYPE_LABELS[alert.alertType]} {alert.threshold}
                    {alert.alertType === "ROI" ? "%" : ""}
                  </p>
                  {alert.triggered && alert.triggeredAt && (
                    <Badge variant="profit" className="mt-1 text-[10px]">
                      Disparou em {formatDate(alert.triggeredAt)}
                    </Badge>
                  )}
                </div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-muted-foreground hover:text-loss"
                onClick={() => deleteMutation.mutate(alert.id)}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
