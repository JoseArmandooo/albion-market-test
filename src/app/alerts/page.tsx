// src/app/alerts/page.tsx
"use client";

import { useState } from "react";
import {
  Bell,
  Plus,
  Trash2,
  BellRing,
  Loader2,
  ShieldAlert,
  CheckCircle2,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { formatDate, formatCurrency } from "@/lib/utils";

async function fetchAlerts(): Promise<Alert[]> {
  const res = await fetch("/api/alerts");
  if (!res.ok) throw new Error("Failed to fetch alerts");
  return res.json();
}

async function createAlert(
  data: Omit<Alert, "id" | "triggered" | "createdAt" | "triggeredAt">
): Promise<Alert> {
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

const ALERT_TYPE_LABELS: Record<Alert["alertType"], string> = {
  ROI: "ROI ≥",
  PROFIT: "Lucro ≥",
  PRICE_DROP: "Queda de preço ≥",
  PRICE_SPIKE: "Subida de preço ≥",
};

const ALERT_TYPE_DESCRIPTIONS: Record<Alert["alertType"], string> = {
  ROI: "Alerta quando o ROI do item atingir o valor configurado",
  PROFIT: "Alerta quando o lucro líquido atingir o valor em silver",
  PRICE_DROP: "Alerta quando o preço cair pelo percentual configurado",
  PRICE_SPIKE: "Alerta quando o preço subir pelo percentual configurado",
};

const defaultForm = {
  itemId: "",
  itemName: "",
  city: "Caerleon" as string,
  alertType: "ROI" as Alert["alertType"],
  threshold: 20,
};

export default function AlertsPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(defaultForm);

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ["alerts"],
    queryFn: fetchAlerts,
    refetchInterval: 30_000,
  });

  const createMutation = useMutation({
    mutationFn: createAlert,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      setForm(defaultForm);
      toast({
        title: "✅ Alerta criado",
        description: `Monitorando ${form.itemName} em ${form.city}`,
        variant: "profit",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao criar alerta",
        variant: "destructive",
      });
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
    if (!form.itemId.trim() || !form.itemName.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o ID e nome do item",
        variant: "destructive",
      });
      return;
    }
    createMutation.mutate(form);
  };

  const triggeredAlerts = alerts.filter((a) => a.triggered);
  const activeAlerts = alerts.filter((a) => !a.triggered);

  return (
    <div className="container mx-auto px-4 py-6 max-w-[1200px]">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold tracking-wide gradient-text">
          Alertas
        </h1>
        <p className="text-muted-foreground mt-1">
          Configure alertas para ser notificado sobre oportunidades
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        {/* Create form */}
        <Card className="border-white/5 bg-black/40 backdrop-blur-sm h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-display">
              <Plus className="h-5 w-5 text-profit" />
              Criar Alerta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-widest font-mono">
                ID do Item
              </Label>
              <Input
                placeholder="ex: T6_MAIN_SWORD@2"
                value={form.itemId}
                onChange={(e) => setForm({ ...form, itemId: e.target.value })}
                className="border-white/10 bg-black/30 font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                ID exato da API do Albion (ex: T6_MAIN_SWORD, T7_2H_BOW@3)
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-widest font-mono">
                Nome do Item
              </Label>
              <Input
                placeholder="ex: T6 Great Sword .2"
                value={form.itemName}
                onChange={(e) => setForm({ ...form, itemName: e.target.value })}
                className="border-white/10 bg-black/30 text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-widest font-mono">
                Cidade
              </Label>
              <Select
                value={form.city}
                onValueChange={(v) => setForm({ ...form, city: v })}
              >
                <SelectTrigger className="border-white/10 bg-black/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CITIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-widest font-mono">
                Tipo de Alerta
              </Label>
              <Select
                value={form.alertType}
                onValueChange={(v) =>
                  setForm({ ...form, alertType: v as Alert["alertType"] })
                }
              >
                <SelectTrigger className="border-white/10 bg-black/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(
                    Object.keys(ALERT_TYPE_LABELS) as Alert["alertType"][]
                  ).map((k) => (
                    <SelectItem key={k} value={k}>
                      {ALERT_TYPE_LABELS[k]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {ALERT_TYPE_DESCRIPTIONS[form.alertType]}
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-widest font-mono">
                Threshold{" "}
                {form.alertType === "ROI"
                  ? "(%)"
                  : form.alertType === "PROFIT"
                  ? "(silver)"
                  : "(%)"}
              </Label>
              <Input
                type="number"
                min="0"
                step={form.alertType === "PROFIT" ? "1000" : "1"}
                value={form.threshold}
                onChange={(e) =>
                  setForm({ ...form, threshold: parseFloat(e.target.value) })
                }
                className="border-white/10 bg-black/30 font-mono"
              />
              {form.alertType === "PROFIT" && (
                <p className="text-xs text-muted-foreground">
                  = {formatCurrency(form.threshold)} silver
                </p>
              )}
            </div>

            <Button
              variant="profit"
              className="w-full"
              onClick={handleCreate}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Bell className="mr-2 h-4 w-4" />
                  Criar Alerta
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Alerts list */}
        <div className="space-y-6">
          {/* Triggered alerts */}
          {triggeredAlerts.length > 0 && (
            <Card className="border-profit/20 bg-profit/[0.03] backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-display">
                  <BellRing className="h-5 w-5 text-profit animate-pulse" />
                  Alertas Disparados
                  <Badge variant="profit" className="ml-auto">
                    {triggeredAlerts.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {triggeredAlerts.map((alert) => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    onDelete={() => deleteMutation.mutate(alert.id)}
                    isDeleting={deleteMutation.isPending}
                  />
                ))}
              </CardContent>
            </Card>
          )}

          {/* Active alerts */}
          <Card className="border-white/5 bg-black/40 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-display">
                <ShieldAlert className="h-5 w-5 text-gold" />
                Alertas Ativos
                <Badge variant="outline" className="ml-auto border-white/10">
                  {activeAlerts.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex h-32 items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : activeAlerts.length === 0 ? (
                <div className="flex h-32 flex-col items-center justify-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="h-8 w-8" />
                  <p className="text-sm">Nenhum alerta ativo</p>
                  <p className="text-xs">Crie um alerta para monitorar oportunidades</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeAlerts.map((alert) => (
                    <AlertCard
                      key={alert.id}
                      alert={alert}
                      onDelete={() => deleteMutation.mutate(alert.id)}
                      isDeleting={deleteMutation.isPending}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function AlertCard({
  alert,
  onDelete,
  isDeleting,
}: {
  alert: Alert;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  return (
    <div
      className={`flex items-start justify-between rounded-lg border p-4 transition-colors ${
        alert.triggered
          ? "border-profit/20 bg-profit/[0.05]"
          : "border-white/5 bg-white/[0.02] hover:bg-white/[0.04]"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
            alert.triggered
              ? "bg-profit/20 text-profit"
              : "bg-white/5 text-muted-foreground"
          }`}
        >
          {alert.triggered ? (
            <BellRing className="h-4 w-4 animate-pulse" />
          ) : (
            <Bell className="h-4 w-4" />
          )}
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold font-display">{alert.itemName}</p>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 border-white/10 h-4"
            >
              {alert.city}
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">
              {ALERT_TYPE_LABELS[alert.alertType]}{" "}
              {alert.alertType === "PROFIT"
                ? formatCurrency(alert.threshold)
                : `${alert.threshold}%`}
            </span>
          </div>
          <p className="text-xs text-muted-foreground font-mono">
            ID: {alert.itemId}
          </p>
          {alert.triggered && alert.triggeredAt && (
            <p className="text-xs text-profit font-mono">
              ✓ Disparou em {formatDate(alert.triggeredAt)}
            </p>
          )}
          <p className="text-xs text-muted-foreground/50 font-mono">
            Criado em {formatDate(alert.createdAt)}
          </p>
        </div>
      </div>
      <Button
        size="icon"
        variant="ghost"
        className="h-7 w-7 shrink-0 text-muted-foreground hover:text-loss hover:bg-loss/10"
        onClick={onDelete}
        disabled={isDeleting}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
