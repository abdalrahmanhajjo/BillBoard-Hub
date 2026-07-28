import type { LucideIcon } from 'lucide-react';
import { cn } from '@/client/ui/lib/utils';

type WorkspacePageProps = {
  title: string;
  description: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
};

/**
 * Page frame for advertiser screens rendered inside the sidebar shell. Unlike
 * `DashboardShell` it does not impose a two-column grid, so each screen chooses
 * its own layout.
 */
export function WorkspacePage({ title, description, actions, children }: WorkspacePageProps) {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
      <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
          <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">{description}</p>
        </div>
        {actions ? <div className="flex shrink-0 gap-2">{actions}</div> : null}
      </header>
      {children}
    </section>
  );
}

type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  className?: string;
};

export function StatCard({ label, value, hint, icon: Icon, className }: StatCardProps) {
  return (
    <div className={cn('bg-card rounded-xl border p-4', className)}>
      <div className="text-muted-foreground flex items-center gap-2 text-xs font-medium tracking-wide uppercase">
        <Icon className="size-3.5" aria-hidden />
        {label}
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      {hint ? <p className="text-muted-foreground mt-1 text-xs">{hint}</p> : null}
    </div>
  );
}

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
};

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="bg-card flex flex-col items-center rounded-xl border px-6 py-12 text-center">
      <span className="bg-muted text-muted-foreground grid size-11 place-items-center rounded-full">
        <Icon className="size-5" aria-hidden />
      </span>
      <p className="mt-3 font-medium">{title}</p>
      <p className="text-muted-foreground mt-1 max-w-sm text-sm leading-relaxed">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
