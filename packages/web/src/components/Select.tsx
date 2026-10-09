import clsx from 'clsx';
import { ChevronDown } from 'lucide-react';
import { forwardRef, type SelectHTMLAttributes } from 'react';

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, ...props }, ref) {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={clsx(
            'w-full appearance-none rounded-lg border border-border bg-white py-2 pl-3 pr-9 text-sm',
            'focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:bg-surface',
            className,
          )}
          {...props}
        />
        <ChevronDown
          aria-hidden
          className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted"
        />
      </div>
    );
  },
);
