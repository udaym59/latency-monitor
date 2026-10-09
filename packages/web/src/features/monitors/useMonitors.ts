import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Monitor, MonitorStats } from '@uptime/shared';
import { apiFetch } from '../../lib/api';

export type MonitorInput = Pick<Monitor, 'name' | 'url' | 'intervalMinutes'>;
export type MonitorPatch = Partial<MonitorInput & Pick<Monitor, 'isPaused'>>;

const LIST_POLL_MS = 30_000;

export const useMonitors = () =>
  useQuery({
    queryKey: ['monitors'],
    queryFn: () => apiFetch<Monitor[]>('/monitors'),
    refetchInterval: LIST_POLL_MS,
  });

/** One stats query per monitor; shares cache keys with the detail page. */
export const useMonitorsStats = (ids: string[]) =>
  useQueries({
    queries: ids.map((id) => ({
      queryKey: ['monitors', id, 'stats'],
      queryFn: () => apiFetch<MonitorStats>(`/monitors/${encodeURIComponent(id)}/stats`),
      refetchInterval: LIST_POLL_MS,
    })),
  });

export const useCreateMonitor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: MonitorInput) =>
      apiFetch<Monitor>('/monitors', { method: 'POST', body: JSON.stringify(input) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['monitors'] }),
  });
};

export const useUpdateMonitor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: MonitorPatch }) =>
      apiFetch<Monitor>(`/monitors/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(patch) }),
    onSuccess: (monitor) => {
      qc.setQueryData(['monitors', monitor.id], monitor);
      return qc.invalidateQueries({ queryKey: ['monitors'] });
    },
  });
};

export const useDeleteMonitor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<void>(`/monitors/${encodeURIComponent(id)}`, { method: 'DELETE' }),
    onSuccess: (_void, id) => {
      // Drop it from the list immediately. Its own queries are left to GC once unmounted —
      // removing/invalidating them while the detail page is still mounted would refetch 404s.
      qc.setQueryData<Monitor[]>(['monitors'], (list) => list?.filter((m) => m.id !== id));
      return qc.invalidateQueries({ queryKey: ['monitors'], exact: true });
    },
  });
};
