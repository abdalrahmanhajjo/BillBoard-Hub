import { Check } from 'lucide-react';
import { cn } from '@/client/ui/lib/utils';

type RegisterStep = {
  id: string;
  label: string;
};

type RegisterStepIndicatorProps = {
  /** Id of the step being filled in right now. */
  current: string;
  steps: RegisterStep[];
};

/**
 * Progress across the registration steps. Rendered as an ordered list so the
 * sequence is conveyed structurally, with `aria-current` marking the active
 * step rather than relying on the colour change alone.
 */
export function RegisterStepIndicator({ current, steps }: RegisterStepIndicatorProps) {
  const currentIndex = Math.max(
    steps.findIndex((step) => step.id === current),
    0,
  );

  return (
    <nav aria-label="Registration progress">
      <ol className="flex items-center gap-3">
        {steps.map((step, index) => {
          const isComplete = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <li key={step.id} className="flex min-w-0 flex-1 items-center gap-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <span
                  aria-hidden
                  className={cn(
                    'grid size-7 shrink-0 place-items-center rounded-full border text-xs font-semibold transition-colors',
                    isComplete && 'border-primary bg-primary text-primary-foreground',
                    isCurrent && 'border-primary text-primary',
                    !isComplete && !isCurrent && 'border-border text-muted-foreground',
                  )}
                >
                  {isComplete ? <Check className="size-3.5" /> : index + 1}
                </span>

                <span
                  aria-current={isCurrent ? 'step' : undefined}
                  className={cn(
                    'truncate text-sm font-medium',
                    isCurrent ? 'text-foreground' : 'text-muted-foreground',
                  )}
                >
                  <span className="sr-only">
                    Step {index + 1} of {steps.length}:{' '}
                  </span>
                  {step.label}
                  {isComplete ? <span className="sr-only"> (completed)</span> : null}
                </span>
              </div>

              {index < steps.length - 1 ? (
                <span
                  aria-hidden
                  className={cn(
                    'h-px min-w-4 flex-1 transition-colors',
                    isComplete ? 'bg-primary' : 'bg-border',
                  )}
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
