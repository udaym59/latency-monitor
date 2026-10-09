import clsx from 'clsx';
import { forwardRef, type ButtonHTMLAttributes } from 'react';

const VARIANTS = {
  primary: 'bg-accent text-white hover:bg-accent/90',
  secondary: 'bg-white border border-border text-foreground hover:bg-surface',
  ghost: 'text-foreground hover:bg-surface',
} as const;

const SIZES = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-9 px-4 text-sm gap-2',
} as const;

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: keyof typeof VARIANTS;
    size?: keyof typeof SIZES;
  }
>(function Button({ variant = 'secondary', size = 'md', type = 'button', className, ...props }, ref) {
  return (
    <button
      ref={ref}
      type={type}
      className={clsx(
        'inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-lg font-medium transition-colors',
        'disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    />
  );
});
