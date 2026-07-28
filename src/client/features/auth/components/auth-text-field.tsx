'use client';

import type { LucideIcon } from 'lucide-react';
import { Input } from '@/client/ui/components/ui/input';
import { cn } from '@/client/ui/lib/utils';
import { describedByIds } from '@/client/features/auth/utils/field-a11y';

type AuthTextFieldProps = Omit<React.ComponentProps<'input'>, 'id'> & {
  id: string;
  label: string;
  icon?: LucideIcon;
  /** Field-level validation message; also flips the input into its invalid state. */
  error?: string;
  hint?: string;
};

export function AuthTextField({
  id,
  label,
  icon: Icon,
  error,
  hint,
  className,
  ...props
}: AuthTextFieldProps) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-foreground block text-sm font-medium">
        {label}
      </label>

      <div className="relative">
        {Icon ? (
          <Icon
            aria-hidden
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
          />
        ) : null}
        <Input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedByIds([error && errorId, hint && hintId])}
          className={cn('h-11 rounded-xl', Icon && 'pl-10', className)}
          {...props}
        />
      </div>

      {hint && !error ? (
        <p id={hintId} className="text-muted-foreground text-xs leading-relaxed">
          {hint}
        </p>
      ) : null}

      {error ? (
        <p
          id={errorId}
          role="alert"
          className="text-destructive text-xs leading-relaxed font-medium"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
