import clsx from 'clsx';
import { forwardRef, type InputHTMLAttributes } from 'react';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={clsx(
          'w-full rounded-lg border border-border bg-white px-3 py-2 text-sm placeholder:text-muted',
          'focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20',
          'aria-invalid:border-danger aria-invalid:focus:ring-danger/20 disabled:bg-surface disabled:text-muted',
          className,
        )}
        {...props}
      />
    );
  },
);
