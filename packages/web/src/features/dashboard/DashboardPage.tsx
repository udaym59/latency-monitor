import { Activity, Plus, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { Input } from '../../components/Input';
import { TopBar } from '../layout/TopBar';
import { MonitorFormModal } from '../monitors/MonitorFormModal';
import { MonitorList, MonitorListSkeleton } from '../monitors/MonitorList';
import { monitorStatus } from '../monitors/monitorStatus';
import { useMonitors, useMonitorsStats } from '../monitors/useMonitors';
import { OverviewStats } from './OverviewStats';

export function DashboardPage() {
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState('');
  const monitors = useMonitors();
  const list = monitors.data ?? [];
  const statsQueries = useMonitorsStats(list.map((m) => m.id));

  useEffect(() => {
    document.title = 'Dashboard · Uptime Monitor';
  }, []);

  const statsById = useMemo(
    () => new Map(list.map((m, i) => [m.id, { data: statsQueries[i]?.data, isPending: statsQueries[i]?.isPending ?? true }])),
    [list, statsQueries],
  );

  const overview = useMemo(() => {
    const statuses = list.map((m) => monitorStatus(m, statsById.get(m.id)?.data?.lastCheck));
    const measured = list
      .filter((m) => !m.isPaused)
      .map((m) => statsById.get(m.id)?.data)
      .filter((s) => s !== undefined && s.totalChecks > 0);
    return {
      total: list.length,
      paused: statuses.filter((s) => s === 'paused').length,
      up: statuses.filter((s) => s === 'up').length,
      down: statuses.filter((s) => s === 'down').length,
      avgUptime: measured.length ? measured.reduce((sum, s) => sum + s!.uptimePercent, 0) / measured.length : null,
    };
  }, [list, statsById]);

  const query = search.trim().toLowerCase();
  const visible = query
    ? list.filter((m) => m.name.toLowerCase().includes(query) || m.url.toLowerCase().includes(query))
    : list;

  const statsLoading = monitors.isPending || statsQueries.some((q) => q.isPending);
  const addButton = (
    <Button variant="primary" onClick={() => setAdding(true)}>
      <Plus aria-hidden />
      Add monitor
    </Button>
  );

  return (
    <>
      <TopBar crumbs={[{ label: 'Dashboard' }]} actions={addButton} />

      <div className="mx-auto max-w-[1440px] space-y-6 px-8 py-6">
        <h1 className="sr-only">Dashboard</h1>

        {monitors.isError ? (
          <ErrorState title="Couldn’t load monitors" error={monitors.error} onRetry={() => void monitors.refetch()} />
        ) : (
          <>
            <OverviewStats loading={statsLoading} {...overview} />

            <section aria-labelledby="monitors-heading" className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <h2 id="monitors-heading" className="flex items-baseline gap-2 text-base">
                  Monitors
                  {!monitors.isPending && (
                    <span className="font-mono text-sm font-normal text-muted tabular-nums">{list.length}</span>
                  )}
                </h2>
                <div className="relative w-full max-w-xs">
                  <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
                  <Input
                    type="search"
                    aria-label="Search monitors"
                    placeholder="Search by name or URL"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    disabled={list.length === 0}
                    className="pl-9"
                  />
                </div>
              </div>

              {monitors.isPending ? (
                <MonitorListSkeleton />
              ) : list.length === 0 ? (
                <Card>
                  <EmptyState
                    icon={Activity}
                    title="No monitors yet"
                    description="Add a URL and we’ll check it on a schedule, track latency, and open an incident when it goes down."
                    action={
                      <Button variant="primary" onClick={() => setAdding(true)}>
                        <Plus aria-hidden />
                        Add your first monitor
                      </Button>
                    }
                  />
                </Card>
              ) : visible.length === 0 ? (
                <Card>
                  <EmptyState
                    icon={Search}
                    title="No matches"
                    description={`No monitors match “${search.trim()}”.`}
                    action={<Button onClick={() => setSearch('')}>Clear search</Button>}
                  />
                </Card>
              ) : (
                <MonitorList monitors={visible} statsById={statsById} />
              )}
            </section>
          </>
        )}
      </div>

      <MonitorFormModal open={adding} onClose={() => setAdding(false)} />
    </>
  );
}
