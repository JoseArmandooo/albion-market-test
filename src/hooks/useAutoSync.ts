import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Hook que sincroniza automaticamente os dados do mercado a cada minuto
 * quando o usuário está visualizando o dashboard.
 * 
 * Substitui a necessidade de Cron Jobs na Vercel para o plano gratuito.
 */
export function useAutoSync(enabled: boolean = true) {
  const queryClient = useQueryClient();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstRun = useRef(true);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Sincroniza imediatamente na primeira vez que o hook é montado
    const syncMarketData = async () => {
      try {
        console.log('[AutoSync] Iniciando sincronização de dados...');
        const response = await fetch('/api/market/sync', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          console.error('[AutoSync] Erro na sincronização:', response.statusText);
          return;
        }

        const data = await response.json();
        console.log('[AutoSync] Sincronização concluída:', data);

        // Invalida o cache do React Query para forçar atualização
        await queryClient.invalidateQueries({ queryKey: ['market'] });
        await queryClient.invalidateQueries({ queryKey: ['stats'] });
        await queryClient.invalidateQueries({ queryKey: ['rankings'] });
      } catch (error) {
        console.error('[AutoSync] Erro ao sincronizar:', error);
      }
    };

    // Sincroniza na primeira vez
    if (isFirstRun.current) {
      syncMarketData();
      isFirstRun.current = false;
    }

    // Configura sincronização a cada 60 segundos (1 minuto)
    intervalRef.current = setInterval(() => {
      syncMarketData();
    }, 60000); // 60 segundos

    // Cleanup: limpa o intervalo quando o componente é desmontado
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, queryClient]);
}
