// src/components/dashboard/SettingsPanel.tsx
"use client";

import { Settings, Volume2, VolumeX, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useAppStore } from "@/store";

interface SettingsPanelProps {
  onClose?: () => void;
}

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  const { settings, setSettings } = useAppStore();

  return (
    <div className="space-y-6 p-1">
      <div className="flex items-center gap-2">
        <Settings className="h-5 w-5 text-muted-foreground" />
        <h3 className="font-display text-lg font-bold tracking-wide">Configurações</h3>
      </div>

      {/* Fees */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest font-mono">
          Taxas de Mercado
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              Taxa de Mercado (%)
            </Label>
            <Input
              type="number"
              min="0"
              max="10"
              step="0.1"
              value={(settings.marketFee * 100).toFixed(1)}
              onChange={(e) =>
                setSettings({
                  marketFee: parseFloat(e.target.value) / 100,
                })
              }
              className="border-white/10 bg-black/30 font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Padrão: 2.5%
            </p>
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              Taxa Premium (%)
            </Label>
            <Input
              type="number"
              min="0"
              max="10"
              step="0.1"
              value={(settings.premiumFee * 100).toFixed(1)}
              onChange={(e) =>
                setSettings({
                  premiumFee: parseFloat(e.target.value) / 100,
                })
              }
              className="border-white/10 bg-black/30 font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Com premium: 3%
            </p>
          </div>
        </div>
      </div>

      <Separator className="bg-white/5" />

      {/* Alerts */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest font-mono">
          Alertas
        </h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {settings.soundAlerts ? (
                <Volume2 className="h-4 w-4 text-profit" />
              ) : (
                <VolumeX className="h-4 w-4 text-muted-foreground" />
              )}
              <Label className="text-sm">Alertas sonoros</Label>
            </div>
            <Switch
              checked={settings.soundAlerts}
              onCheckedChange={(v) => setSettings({ soundAlerts: v })}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              ROI mínimo para alerta (%)
            </Label>
            <Input
              type="number"
              min="0"
              max="1000"
              step="5"
              value={settings.minRoi}
              onChange={(e) =>
                setSettings({ minRoi: parseFloat(e.target.value) })
              }
              className="border-white/10 bg-black/30 font-mono"
            />
          </div>
        </div>
      </div>

      <Separator className="bg-white/5" />

      {/* Auto refresh */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest font-mono">
          Atualização Automática
        </h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm">Auto-refresh</Label>
            </div>
            <Switch
              checked={settings.autoRefresh}
              onCheckedChange={(v) => setSettings({ autoRefresh: v })}
            />
          </div>

          {settings.autoRefresh && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">
                Intervalo (segundos)
              </Label>
              <Input
                type="number"
                min="15"
                max="3600"
                step="15"
                value={settings.refreshInterval}
                onChange={(e) =>
                  setSettings({ refreshInterval: parseInt(e.target.value) })
                }
                className="border-white/10 bg-black/30 font-mono"
              />
            </div>
          )}
        </div>
      </div>

      {onClose && (
        <Button
          variant="outline"
          className="w-full border-white/10"
          onClick={onClose}
        >
          Fechar
        </Button>
      )}
    </div>
  );
}
