import clsx from 'clsx';
import type { ReactNode } from 'react';

const TONES = {
  neutral: 'bg-surface text-muted ring-border',
  success: 'bg-success/10 text-success-strong ring-success/20',
  danger: 'bg-danger/10 text-danger-strong ring-danger/20',
  warning: 'bg-warning/10 text-warning-strong ring-warning/20',
} as const;

export function Badge({ tone = 'neutral', children }: { tone?: keyof typeof TONES; children: ReactNode }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
        TONES[tone],
      )}
    >
      {children}
    </span>
  );
}
