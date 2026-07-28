import { CircleAlert, CircleCheck, Info } from 'lucide-react';
import { cn } from '@/client/ui/lib/utils';

type AuthAlertVariant = 'error' | 'success' | 'info';

type AuthAlertProps = {
  variant?: AuthAlertVariant;
  title?: string;
  children?: React.ReactNode;
  className?: string;
};

const VARIANT_STYLES: Record<AuthAlertVariant, { container: string; icon: typeof Info }> = {
  error: {
    container:
      'border-destructive/30 bg-destructive/8 text-destructive dark:border-destructive/40 dark:bg-destructive/12',
    icon: CircleAlert,
  },
  success: {
    container:
      'border-emerald-600/30 bg-emerald-50 text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-950/40 dark:text-emerald-200',
    icon: CircleCheck,
  },
  info: {
    container: 'border-border bg-muted/60 text-foreground dark:bg-muted/40',
    icon: Info,
  },
};

/**
 * Announcements for form-wide outcomes. Failures use `role="alert"` so they
 * interrupt, successes use `role="status"` so they queue politely.
 */
export function AuthAlert({ variant = 'error', title, children, className }: AuthAlertProps) {
  const { container, icon: Icon } = VARIANT_STYLES[variant];

  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={cn(
        'flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-sm',
        container,
        className,
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div className="min-w-0 space-y-1">
        {title ? <p className="leading-snug font-semibold">{title}</p> : null}
        {children ? <div className="leading-relaxed opacity-95">{children}</div> : null}
      </div>
    </div>
  );
}
