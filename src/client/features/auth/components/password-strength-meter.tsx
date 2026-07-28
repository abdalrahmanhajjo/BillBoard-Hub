'use client';

import { Check, X } from 'lucide-react';
import { PASSWORD_RULES, scorePassword } from '@/shared/contracts/auth/password.schema';
import { cn } from '@/client/ui/lib/utils';

type PasswordStrengthMeterProps = {
  value: string;
  /** Wired into the field's `aria-describedby` by the caller. */
  id?: string;
};

const SEGMENT_COLORS = [
  'bg-destructive',
  'bg-destructive',
  'bg-amber-500',
  'bg-blue-500',
  'bg-emerald-500',
] as const;

const LABEL_COLORS = [
  'text-destructive',
  'text-destructive',
  'text-amber-600 dark:text-amber-400',
  'text-blue-600 dark:text-blue-400',
  'text-emerald-600 dark:text-emerald-400',
] as const;

export function PasswordStrengthMeter({ value, id }: PasswordStrengthMeterProps) {
  const { score, label, satisfiedRuleIds } = scorePassword(value);
  const filledSegments = value ? score + 1 : 0;

  return (
    <div id={id} className="space-y-2.5 pt-0.5">
      <div className="flex items-center gap-2.5">
        <div className="flex flex-1 gap-1" aria-hidden>
          {[0, 1, 2, 3, 4].map((segment) => (
            <span
              key={segment}
              className={cn(
                'h-1 flex-1 rounded-full transition-colors duration-300',
                segment < filledSegments ? SEGMENT_COLORS[score] : 'bg-border',
              )}
            />
          ))}
        </div>
        <span
          className={cn(
            'w-16 shrink-0 text-right text-xs font-semibold',
            value ? LABEL_COLORS[score] : 'text-muted-foreground',
          )}
        >
          {value ? label : '—'}
        </span>
      </div>

      {/* Polite: the checklist updates on every keystroke, so it must not
          interrupt the user mid-word. */}
      <ul className="grid gap-1.5 sm:grid-cols-2" aria-live="polite">
        {PASSWORD_RULES.map((rule) => {
          const isSatisfied = satisfiedRuleIds.includes(rule.id);

          return (
            <li
              key={rule.id}
              className={cn(
                'flex items-center gap-1.5 text-xs transition-colors',
                isSatisfied ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground',
              )}
            >
              {isSatisfied ? (
                <Check className="size-3.5 shrink-0" aria-hidden />
              ) : (
                <X className="size-3.5 shrink-0 opacity-50" aria-hidden />
              )}
              <span>
                {rule.label}
                <span className="sr-only">{isSatisfied ? ' — met' : ' — not met yet'}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
