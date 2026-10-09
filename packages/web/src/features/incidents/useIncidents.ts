import { useQuery } from '@tanstack/react-query';
import type { Incident } from '@uptime/shared';
import { apiFetch } from '../../lib/api';

export const useIncidents = (monitorId: string) =>
  useQuery({
    queryKey: ['monitors', monitorId, 'incidents'],
    queryFn: () => apiFetch<Incident[]>(`/monitors/${encodeURIComponent(monitorId)}/incidents`),
    refetchInterval: 15_000,
  });
