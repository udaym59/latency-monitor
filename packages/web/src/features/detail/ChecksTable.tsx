import type { Check } from '@uptime/shared';
import { ListChecks } from 'lucide-react';
import { Badge } from '../../components/Badge';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { Skeleton } from '../../components/Skeleton';
import { formatLatency, formatTimestamp } from '../../lib/format';

const HEAD = 'px-4 py-2.5 text-left text-xs font-medium text-muted first:pl-6 last:pr-6';
const CELL = 'px-4 py-2 first:pl-6 last:pr-6';

export function ChecksTable({ checks, isPending }: { checks: Check[] | undefined; isPending: boolean }) {
  return (
    <Card aria-labelledby="checks-heading" className="overflow-hidden">
      <div className="flex items-baseline justify-between border-b border-border px-6 py-4">
        <h2 id="checks-heading" className="text-base">
          Recent checks
        </h2>
        {checks && checks.length > 0 && <p className="text-xs text-muted">Last {checks.length}</p>}
      </div>

      {!isPending && checks?.length === 0 ? (
        <EmptyState icon={ListChecks} title="No checks yet" description="The first check runs within a minute." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <caption className="sr-only">Most recent checks, newest first</caption>
            <colgroup>
              <col className="w-48" />
              <col className="w-28" />
              <col className="w-24" />
              <col className="w-28" />
              <col />
            </colgroup>
            <thead className="border-b border-border">
              <tr>
                <th scope="col" className={HEAD}>Time</th>
                <th scope="col" className={HEAD}>Status</th>
                <th scope="col" className={HEAD}>HTTP</th>
                <th scope="col" className={`${HEAD} text-right`}>Latency</th>
                <th scope="col" className={HEAD}>Error</th>
              </tr>
            </thead>
            <tbody aria-busy={isPending || undefined}>
              {isPending
                ? Array.from({ length: 6 }, (_, i) => (
                    <tr key={i} className="odd:bg-surface">
                      {[0, 1, 2, 3, 4].map((j) => (
                        <td key={j} className={CELL}>
                          <Skeleton className="h-4 w-full max-w-24" />
                        </td>
                      ))}
                    </tr>
                  ))
                : checks!.map((check) => (
                    <tr key={check.checkedAt} className="odd:bg-surface">
                      <td className={`${CELL} font-mono text-xs tabular-nums`}>
                        <time dateTime={check.checkedAt}>{formatTimestamp(check.checkedAt)}</time>
                      </td>
                      <td className={CELL}>
                        <Badge tone={check.ok ? 'success' : 'danger'}>{check.ok ? 'Up' : 'Down'}</Badge>
                      </td>
                      <td className={`${CELL} font-mono text-xs tabular-nums`}>{check.statusCode ?? '—'}</td>
                      <td className={`${CELL} text-right font-mono text-xs tabular-nums`}>
                        {formatLatency(check.latencyMs)}
                      </td>
                      <td className={`${CELL} truncate font-mono text-xs text-muted`} title={check.error ?? undefined}>
                        {check.error ?? ''}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
