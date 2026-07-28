'use client';

import { Loader2 } from 'lucide-react';
import { Button } from '@/client/ui/components/ui/button';
import { cn } from '@/client/ui/lib/utils';

type AuthSubmitButtonProps = React.ComponentProps<typeof Button> & {
  pending: boolean;
  /** Replaces the label while the request is in flight. */
  pendingLabel: string;
};

export function AuthSubmitButton({
  pending,
  pendingLabel,
  children,
  className,
  ...props
}: AuthSubmitButtonProps) {
  return (
    <Button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={cn('h-11 w-full gap-2 rounded-xl text-sm font-semibold', className)}
      {...props}
    >
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" aria-hidden />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
