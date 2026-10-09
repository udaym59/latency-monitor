import { ArrowLeft, SearchX } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { ApiError } from '../../lib/api';
import { IncidentsTimeline } from '../incidents/IncidentsTimeline';
import { TopBar } from '../layout/TopBar';
import { MonitorFormModal } from '../monitors/MonitorFormModal';
import { STATUS_LABEL, STATUS_TONE, monitorStatus } from '../monitors/monitorStatus';
import { useDeleteMonitor, useUpdateMonitor } from '../monitors/useMonitors';
import { ChecksTable } from './ChecksTable';
import { LatencyChart } from './LatencyChart';
import { StatsHeader, StatsHeaderSkeleton } from './StatsHeader';
import { CHECKS_LIMIT, useMonitorDetail } from './useMonitorDetail';

const TABLE_ROWS = 50;

export function MonitorDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const { monitor, stats, checks } = useMonitorDetail(id);
  const update = useUpdateMonitor();
  const remove = useDeleteMonitor();

  useEffect(() => {
    document.title = `${monitor.data?.name ?? 'Monitor'} · Uptime Monitor`;
  }, [monitor.data?.name]);

  const notFound = monitor.error instanceof ApiError && monitor.error.status === 404;
  const backLink = (
    <Link to="/" className="inline-flex items-center gap-1.5 text-muted transition-colors hover:text-foreground">
      <ArrowLeft aria-hidden className="size-4" />
      Dashboard
    </Link>
  );

  if (notFound) {
    return (
      <>
        <TopBar crumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Not found' }]} />
        <div className="mx-auto max-w-[1440px] space-y-6 px-8 py-6">
          {backLink}
          <Card>
            <EmptyState
              icon={SearchX}
              title="Monitor not found"
              description="It may have been deleted."
              action={<Link to="/" className="font-medium text-accent hover:underline">Back to dashboard</Link>}
            />
          </Card>
        </div>
      </>
    );
  }

  const m = monitor.data;
  const status = m ? monitorStatus(m, stats.data?.lastCheck) : 'unknown';

  return (
    <>
      <TopBar crumbs={[{ label: 'Dashboard', to: '/' }, { label: m?.name ?? '…' }]} />

      <div className="mx-auto max-w-[1440px] space-y-6 px-8 py-6">
        {backLink}

        {monitor.isError && !m ? (
          <ErrorState title="Couldn’t load monitor" error={monitor.error} onRetry={() => void monitor.refetch()} />
        ) : !m ? (
          <StatsHeaderSkeleton />
        ) : (
          <StatsHeader
            monitor={m}
            stats={stats.data}
            statsLoading={stats.isPending}
            status={status}
            statusLabel={STATUS_LABEL[status]}
            statusTone={STATUS_TONE[status]}
            busy={update.isPending || remove.isPending}
            onEdit={() => setEditing(true)}
            onTogglePause={() => update.mutate({ id, patch: { isPaused: !m.isPaused } })}
            onDelete={() => {
              if (window.confirm(`Delete “${m.name}”? Its check history and incidents are removed too.`)) {
                remove.mutate(id, { onSuccess: () => navigate('/', { replace: true }) });
              }
            }}
          />
        )}

        <LatencyChart
          checks={checks.data}
          isPending={checks.isPending}
          error={checks.data ? null : checks.error}
          onRetry={() => void checks.refetch()}
          limit={CHECKS_LIMIT}
        />

        <IncidentsTimeline monitorId={id} />

        <ChecksTable checks={checks.data?.slice(0, TABLE_ROWS)} isPending={checks.isPending} />
      </div>

      {m && <MonitorFormModal open={editing} onClose={() => setEditing(false)} monitor={m} />}
    </>
  );
}
