import clsx from 'clsx';
import { Activity, LayoutDashboard } from 'lucide-react';
import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';

const NAV = [{ to: '/', label: 'Dashboard', icon: LayoutDashboard }] as const;

export function Sidebar({ footer }: { footer?: ReactNode }) {
  return (
    <aside className="fixed inset-y-0 left-0 flex w-60 flex-col border-r border-border bg-white">
      <div className="flex h-14 items-center gap-2.5 border-b border-border px-5">
        <span className="flex size-7 items-center justify-center rounded-lg bg-foreground text-white">
          <Activity aria-hidden className="size-4" />
        </span>
        <span className="font-semibold tracking-tight">Uptime Monitor</span>
      </div>

      <nav aria-label="Main" className="flex-1 p-3">
        <ul className="space-y-0.5">
          {NAV.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              {/* Not `end`: monitor detail pages live under the dashboard */}
              <NavLink
                to={to}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-2.5 rounded-lg px-3 py-2 font-medium transition-colors',
                    isActive ? 'bg-accent/5 text-accent' : 'text-muted hover:bg-surface hover:text-foreground',
                  )
                }
              >
                <Icon aria-hidden className="size-4" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {footer && <div className="border-t border-border px-5 py-4">{footer}</div>}
    </aside>
  );
}
