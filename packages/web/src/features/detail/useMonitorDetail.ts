import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Check, Monitor, MonitorStats } from '@uptime/shared';
import { apiFetch } from '../../lib/api';

const DETAIL_POLL_MS = 15_000;
export const CHECKS_LIMIT = 500; // API max; covers 24h for intervals ≥ 5 min

export function useMonitorDetail(id: string) {
  const qc = useQueryClient();
  const base = `/monitors/${encodeURIComponent(id)}`;

  const monitor = useQuery({
    queryKey: ['monitors', id],
    queryFn: () => apiFetch<Monitor>(base),
    // Instant header when arriving from the dashboard
    placeholderData: () => qc.getQueryData<Monitor[]>(['monitors'])?.find((m) => m.id === id),
    refetchInterval: DETAIL_POLL_MS,
  });

  const stats = useQuery({
    queryKey: ['monitors', id, 'stats'],
    queryFn: () => apiFetch<MonitorStats>(`${base}/stats`),
    refetchInterval: DETAIL_POLL_MS,
  });

  const checks = useQuery({
    queryKey: ['monitors', id, 'checks', CHECKS_LIMIT],
    queryFn: () => apiFetch<Check[]>(`${base}/checks?limit=${CHECKS_LIMIT}`),
    refetchInterval: DETAIL_POLL_MS,
  });

  return { monitor, stats, checks };
}
