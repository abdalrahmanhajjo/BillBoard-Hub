'use client';

import type { LucideIcon } from 'lucide-react';
import { AlertCircle, ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { Badge } from '@/client/ui/components/ui/badge';
import { Button } from '@/client/ui/components/ui/button';
import { Skeleton } from '@/client/ui/components/ui/skeleton';
import { cn } from '@/client/ui/lib/utils';

/**
 * The advertiser workspace shares this frame with several admin screens, so
 * every prop added here is optional: an existing caller keeps its current
 * layout and only opts into the richer treatment when it passes the new props.
 */
type WorkspacePageProps = {
  title: string;
  description: string;
  /** Small capsule above the title, e.g. "Overview". */
  eyebrow?: string;
  actions?: React.ReactNode;
  /** Renders the tinted canvas used by the dashboard-grade screens. */
  canvas?: boolean;
  children: React.ReactNode;
};

/** Soft elevated surface shared by cards across the workspace. */
export const WORKSPACE_CARD =
  'rounded-2xl border border-border/70 bg-background/90 shadow-[0_24px_60px_-38px_rgba(15,23,42,0.35)] backdrop-blur-sm';

export function WorkspacePage({
  title,
  description,
  eyebrow,
  actions,
  canvas = false,
  children,
}: WorkspacePageProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      className={cn(
        'min-h-full',
        canvas &&
          'bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.10),transparent_32%),linear-gradient(180deg,#f8fbff_0%,#ffffff_45%)]',
      )}
    >
      <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
        <motion.header
          initial={shouldReduceMotion ? undefined : { opacity: 0, y: 14 }}
          animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"
        >
          <div className="space-y-1.5">
            {eyebrow ? (
              <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
                {eyebrow}
              </Badge>
            ) : null}
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
            <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">{description}</p>
          </div>
          {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
        </motion.header>
        {children}
      </div>
    </section>
  );
}

type Trend = {
  /** Percentage change against the comparison period. */
  value: number;
  label: string;
};

type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  /** Tailwind classes for the icon chip, e.g. 'bg-emerald-50 text-emerald-700'. */
  accent?: string;
  trend?: Trend;
  /** Staggers the entrance animation when rendered in a grid. */
  index?: number;
  className?: string;
};

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = 'bg-blue-50 text-blue-700',
  trend,
  index = 0,
  className,
}: StatCardProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? undefined : { opacity: 0, y: 18 }}
      animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut', delay: index * 0.05 }}
      className={cn(WORKSPACE_CARD, 'p-4', className)}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          {label}
        </span>
        <span className={cn('grid size-9 shrink-0 place-items-center rounded-xl', accent)}>
          <Icon className="size-4" aria-hidden />
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
        {trend ? <TrendPill {...trend} /> : null}
        {hint ? <span className="text-muted-foreground text-xs">{hint}</span> : null}
      </div>
    </motion.div>
  );
}

/**
 * A flat trend reads as "no change", which is information — so zero gets its own
 * neutral treatment rather than being coloured as a gain.
 */
function TrendPill({ value, label }: Trend) {
  const rounded = Number(value.toFixed(1));
  const Icon = rounded > 0 ? ArrowUpRight : rounded < 0 ? ArrowDownRight : Minus;
  const tone =
    rounded > 0
      ? 'bg-emerald-50 text-emerald-700'
      : rounded < 0
        ? 'bg-rose-50 text-rose-700'
        : 'bg-muted text-muted-foreground';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-xs font-medium',
        tone,
      )}
    >
      <Icon className="size-3" aria-hidden />
      {rounded > 0 ? '+' : ''}
      {rounded}%<span className="text-muted-foreground font-normal">{label}</span>
    </span>
  );
}

type SectionCardProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
};

/** Consistent titled container for a chart, table, or list. */
export function SectionCard({
  title,
  description,
  action,
  className,
  bodyClassName,
  children,
}: SectionCardProps) {
  return (
    <section className={cn(WORKSPACE_CARD, 'overflow-hidden', className)}>
      <header className="flex flex-wrap items-start justify-between gap-3 px-5 pt-5 pb-4">
        <div className="min-w-0">
          <h2 className="text-base font-semibold tracking-tight">{title}</h2>
          {description ? (
            <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">{description}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </header>
      <div className={cn('px-5 pb-5', bodyClassName)}>{children}</div>
    </section>
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
    <div className="border-border/70 flex flex-col items-center rounded-2xl border border-dashed px-6 py-12 text-center">
      <span className="bg-muted text-muted-foreground grid size-11 place-items-center rounded-full">
        <Icon className="size-5" aria-hidden />
      </span>
      <p className="mt-3 font-medium">{title}</p>
      <p className="text-muted-foreground mt-1 max-w-sm text-sm leading-relaxed">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

/**
 * Loading placeholder shaped like the screen it replaces. A spinner tells the
 * reader only that something is happening; a matching skeleton also stops the
 * layout jumping when the data lands.
 */
export function WorkspaceSkeleton({ cards = 4, rows = 5 }: { cards?: number; rows?: number }) {
  return (
    <div className="space-y-6" aria-busy role="status" aria-label="Loading workspace">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: cards }).map((_, index) => (
          <div key={index} className={cn(WORKSPACE_CARD, 'space-y-3 p-4')}>
            <div className="flex items-start justify-between">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="size-9 rounded-xl" />
            </div>
            <Skeleton className="h-7 w-20" />
            <Skeleton className="h-3 w-28" />
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className={cn(WORKSPACE_CARD, 'space-y-3 p-5')}>
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-52 w-full rounded-xl" />
        </div>
        <div className={cn(WORKSPACE_CARD, 'space-y-3 p-5')}>
          <Skeleton className="h-4 w-32" />
          <Skeleton className="mx-auto size-40 rounded-full" />
        </div>
      </div>
      <div className={cn(WORKSPACE_CARD, 'space-y-3 p-5')}>
        <Skeleton className="h-4 w-44" />
        {Array.from({ length: rows }).map((_, index) => (
          <Skeleton key={index} className="h-10 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}

/** Failure state that offers the one action that can help: try again. */
export function WorkspaceError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div
      role="alert"
      className={cn(WORKSPACE_CARD, 'flex flex-col items-center px-6 py-12 text-center')}
    >
      <span className="bg-destructive/10 text-destructive grid size-11 place-items-center rounded-full">
        <AlertCircle className="size-5" aria-hidden />
      </span>
      <p className="mt-3 font-medium">We could not load this screen</p>
      <p className="text-muted-foreground mt-1 max-w-sm text-sm leading-relaxed">{message}</p>
      {onRetry ? (
        <Button variant="outline" className="mt-4" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}
