import { Badge } from '../../components/Badge';
import { Card } from '../../components/Card';
import { ErrorState } from '../../components/ErrorState';
import { Skeleton } from '../../components/Skeleton';
import { StatusDot } from '../../components/StatusDot';
import { formatDuration, formatRelative, formatTimestamp } from '../../lib/format';
import { useIncidents } from './useIncidents';

export function IncidentsTimeline({ monitorId }: { monitorId: string }) {
  const incidents = useIncidents(monitorId);
  const openCount = incidents.data?.filter((i) => i.resolvedAt === null).length ?? 0;

  if (incidents.isError) {
    return <ErrorState title="Couldn’t load incidents" error={incidents.error} onRetry={() => void incidents.refetch()} />;
  }

  return (
    <Card aria-labelledby="incidents-heading">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <h2 id="incidents-heading" className="text-base">
          Incidents
        </h2>
        {openCount > 0 && <Badge tone="danger">{openCount} ongoing</Badge>}
      </div>

      {incidents.isPending ? (
        <ul aria-busy="true" aria-label="Loading incidents" className="space-y-4 p-6">
          {[0, 1].map((i) => (
            <li key={i} className="flex items-center gap-3">
              <Skeleton className="size-2 rounded-full" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 flex-1" />
            </li>
          ))}
        </ul>
      ) : incidents.data.length === 0 ? (
        <p className="px-6 py-8 text-center text-muted">No incidents in the last 30 days ✓</p>
      ) : (
        <ol className="relative px-6 py-2">
          {incidents.data.map((incident) => {
            const open = incident.resolvedAt === null;
            const end = open ? Date.now() : Date.parse(incident.resolvedAt!);
            const duration = formatDuration(end - Date.parse(incident.startedAt));
            return (
              <li
                key={incident.startedAt}
                className="grid grid-cols-[auto_minmax(0,11rem)_minmax(0,10rem)_1fr] items-center gap-4 border-b border-border py-3 last:border-b-0"
              >
                <StatusDot status={open ? 'down' : 'up'} label={open ? 'Ongoing' : 'Resolved'} />
                <div className="min-w-0">
                  <time dateTime={incident.startedAt} className="font-mono text-xs tabular-nums">
                    {formatTimestamp(incident.startedAt)}
                  </time>
                  <p className="text-xs text-muted">{formatRelative(incident.startedAt)}</p>
                </div>
                <div>
                  {open ? (
                    <Badge tone="danger">Ongoing · {duration}</Badge>
                  ) : (
                    <span className="font-mono text-xs tabular-nums">
                      <span className="sr-only">Lasted </span>
                      {duration}
                    </span>
                  )}
                </div>
                <p className="truncate font-mono text-xs text-muted" title={incident.lastError ?? undefined}>
                  {incident.lastError ?? '—'}
                </p>
              </li>
            );
          })}
        </ol>
      )}
    </Card>
  );
}
