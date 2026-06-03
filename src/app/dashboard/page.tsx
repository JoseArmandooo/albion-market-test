'use client';

import { useState, useEffect } from 'react';
import { useAutoSync } from '@/hooks/useAutoSync';
import { MarketTable } from '@/components/dashboard/MarketTable';
import { MarketFilters } from '@/components/dashboard/MarketFilters';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { AlertsPanel } from '@/components/dashboard/AlertsPanel';
import { SettingsPanel } from '@/components/dashboard/SettingsPanel';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export default function DashboardPage() {
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Ativa a sincronização automática
  useAutoSync(autoSyncEnabled);

  // Atualiza o horário da última sincronização
  useEffect(() => {
    const updateSyncTime = () => {
      setLastSyncTime(new Date());
    };

    const interval = setInterval(updateSyncTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch('/api/market/sync', { method: 'GET' });
      if (response.ok) {
        setLastSyncTime(new Date());
        console.log('Sincronização manual concluída');
      }
    } catch (error) {
      console.error('Erro ao sincronizar manualmente:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header com status de sincronização */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Albion Market Analyzer</h1>
            <p className="text-slate-400 text-sm mt-1">
              ⚡ Sincronização automática ativa
              {lastSyncTime && (
                <span className="ml-2">
                  • Última atualização: {lastSyncTime.toLocaleTimeString('pt-BR')}
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleManualSync}
              disabled={isSyncing}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Sincronizando...' : 'Sincronizar Agora'}
            </Button>
            <Button
              onClick={() => setAutoSyncEnabled(!autoSyncEnabled)}
              variant={autoSyncEnabled ? 'default' : 'outline'}
              size="sm"
            >
              {autoSyncEnabled ? '✓ Auto' : 'Auto Desativado'}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <StatsCards />

        {/* Filtros e Tabela */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-4">
            <MarketFilters />
            <MarketTable />
          </div>

          {/* Sidebar com Alertas e Configurações */}
          <div className="space-y-4">
            <AlertsPanel />
            <SettingsPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
