import type { Check } from '@uptime/shared';

const TIMEOUT_MS = 10_000;

export type HttpResult = Pick<Check, 'ok' | 'statusCode' | 'latencyMs' | 'error'>;

/** Never throws: every failure mode is encoded in the result. */
export async function httpCheck(url: string): Promise<HttpResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const start = performance.now();
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: { 'user-agent': 'uptime-monitor/0.1 (+health-check)' },
    });
    const latencyMs = Math.round(performance.now() - start); // time to response headers
    await res.body?.cancel().catch(() => {}); // free the socket; we don't need the body
    return { ok: res.ok, statusCode: res.status, latencyMs, error: res.ok ? null : `HTTP ${res.status}` };
  } catch (err) {
    return { ok: false, statusCode: null, latencyMs: null, error: describeError(err, controller.signal.aborted) };
  } finally {
    clearTimeout(timer);
  }
}

function describeError(err: unknown, timedOut: boolean): string {
  if (timedOut) return `Timed out after ${TIMEOUT_MS}ms`;
  // undici wraps network failures as TypeError('fetch failed') with the real reason in `cause`.
  const cause = err instanceof Error ? err.cause : undefined;
  if (cause instanceof Error) return 'code' in cause ? `${String(cause.code)}: ${cause.message}` : cause.message;
  return err instanceof Error ? err.message : String(err);
}
