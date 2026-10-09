import type { Monitor, MonitorStats } from '@uptime/shared';
import { Card } from '../../components/Card';
import { Skeleton } from '../../components/Skeleton';
import { MonitorCard } from './MonitorCard';

export function MonitorList({
  monitors,
  statsById,
}: {
  monitors: Monitor[];
  statsById: Map<string, { data: MonitorStats | undefined; isPending: boolean }>;
}) {
  return (
    <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {monitors.map((monitor) => {
        const stats = statsById.get(monitor.id);
        return (
          <li key={monitor.id}>
            <MonitorCard monitor={monitor} stats={stats?.data} statsLoading={stats?.isPending ?? true} />
          </li>
        );
      })}
    </ul>
  );
}

export function MonitorListSkeleton() {
  return (
    <ul aria-busy="true" aria-label="Loading monitors" className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {[0, 1, 2].map((i) => (
        <li key={i}>
          <Card className="p-5">
            <div className="flex items-center gap-2.5">
              <Skeleton className="size-2 rounded-full" />
              <Skeleton className="h-5 w-32" />
            </div>
            <Skeleton className="mt-2 h-3.5 w-48" />
            <div className="mt-5 grid grid-cols-3 gap-3 border-t border-border pt-4">
              {[0, 1, 2].map((j) => (
                <div key={j} className="space-y-1.5">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </Card>
        </li>
      ))}
    </ul>
  );
}
