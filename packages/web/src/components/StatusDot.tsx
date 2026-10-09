import clsx from 'clsx';

const COLORS = {
  up: 'bg-success',
  down: 'bg-danger',
  paused: 'bg-warning',
  unknown: 'bg-muted/50',
  checking: 'bg-muted animate-pulse',
} as const;

/** Decorative by default; pass `label` when the dot is the only status signal. */
export function StatusDot({ status, label }: { status: keyof typeof COLORS; label?: string }) {
  return (
    <span
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={clsx('inline-block size-2 shrink-0 rounded-full', COLORS[status])}
    />
  );
}
