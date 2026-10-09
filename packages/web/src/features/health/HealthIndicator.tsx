import { useQuery } from '@tanstack/react-query';
import type { HealthResponse } from '@uptime/shared';
import { StatusDot } from '../../components/StatusDot';
import { apiFetch } from '../../lib/api';

export function HealthIndicator() {
  const health = useQuery({
    queryKey: ['health'],
    queryFn: () => apiFetch<HealthResponse>('/health'),
    refetchInterval: 30_000,
    retry: false,
  });

  const status = health.isPending ? 'checking' : health.isError ? 'down' : 'up';
  const label = health.isPending ? 'Connecting…' : health.isError ? 'API unreachable' : 'API connected';

  return (
    <div role="status" className="flex items-center gap-2 text-xs text-muted">
      <StatusDot status={status} />
      {label}
    </div>
  );
}
