'use client';

import { useState } from 'react';
import { Eye, EyeOff, Lock, TriangleAlert } from 'lucide-react';
import { Input } from '@/client/ui/components/ui/input';
import { cn } from '@/client/ui/lib/utils';
import { describedByIds } from '@/client/features/auth/utils/field-a11y';

type AuthPasswordFieldProps = Omit<React.ComponentProps<'input'>, 'id' | 'type'> & {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  /** Rendered opposite the label — used for the "Forgot password?" link. */
  labelAction?: React.ReactNode;
};

export function AuthPasswordField({
  id,
  label,
  error,
  hint,
  labelAction,
  className,
  onKeyUp,
  onBlur,
  ...props
}: AuthPasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);

  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const capsLockId = `${id}-caps-lock`;

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-foreground block text-sm font-medium">
          {label}
        </label>
        {labelAction}
      </div>

      <div className="relative">
        <Lock
          aria-hidden
          className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
        />
        <Input
          id={id}
          type={isVisible ? 'text' : 'password'}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedByIds([
            error && errorId,
            hint && hintId,
            isCapsLockOn && capsLockId,
          ])}
          className={cn('h-11 rounded-xl pr-11 pl-10', className)}
          onKeyUp={(event) => {
            setIsCapsLockOn(event.getModifierState('CapsLock'));
            onKeyUp?.(event);
          }}
          onBlur={(event) => {
            setIsCapsLockOn(false);
            onBlur?.(event);
          }}
          {...props}
        />
        <button
          type="button"
          onClick={() => setIsVisible((visible) => !visible)}
          aria-pressed={isVisible}
          aria-controls={id}
          aria-label={isVisible ? 'Hide password' : 'Show password'}
          className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 absolute top-1/2 right-2 grid size-8 -translate-y-1/2 place-items-center rounded-lg transition-colors focus-visible:ring-3 focus-visible:outline-none"
        >
          {isVisible ? (
            <EyeOff className="size-4" aria-hidden />
          ) : (
            <Eye className="size-4" aria-hidden />
          )}
        </button>
      </div>

      {isCapsLockOn ? (
        <p
          id={capsLockId}
          role="status"
          className="flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-400"
        >
          <TriangleAlert className="size-3.5 shrink-0" aria-hidden />
          Caps Lock is on.
        </p>
      ) : null}

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
