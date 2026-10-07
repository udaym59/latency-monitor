import { useEffect, useState } from 'react';
import type { HealthResponse } from '@uptime/shared';
import { apiFetch } from '../../lib/api';

type HealthState =
  | { status: 'loading' }
  | { status: 'connected'; data: HealthResponse }
  | { status: 'error'; message: string };

export function HealthIndicator() {
  const [state, setState] = useState<HealthState>({ status: 'loading' });

  useEffect(() => {
    let ignore = false;

    apiFetch<HealthResponse>('/health')
      .then((data) => {
        if (!ignore) setState({ status: 'connected', data });
      })
      .catch((err: unknown) => {
        if (!ignore) {
          setState({
            status: 'error',
            message: err instanceof Error ? err.message : 'Unknown error',
          });
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div role="status" aria-live="polite" className="flex items-center gap-2 text-sm">
      {state.status === 'loading' && (
        <>
          <Dot className="animate-pulse bg-muted" />
          <span className="text-muted">Checking connection…</span>
        </>
      )}

      {state.status === 'connected' && (
        <>
          <Dot className="bg-success" />
          <span className="font-medium">Connected</span>
          <time dateTime={state.data.timestamp} className="text-muted">
            {new Date(state.data.timestamp).toLocaleTimeString()}
          </time>
        </>
      )}

      {state.status === 'error' && (
        <>
          <Dot className="bg-danger" />
          <span className="font-medium">Disconnected</span>
          <span className="truncate text-muted">{state.message}</span>
        </>
      )}
    </div>
  );
}

function Dot({ className }: { className: string }) {
  return <span aria-hidden className={`size-2 shrink-0 rounded-full ${className}`} />;
}
