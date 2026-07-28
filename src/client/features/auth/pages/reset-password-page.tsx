'use client';

import Link from 'next/link';
import { LinkIcon } from 'lucide-react';
import type { PublicBillboard } from '@/shared/types/billboard';
import { Button } from '@/client/ui/components/ui/button';
import { Skeleton } from '@/client/ui/components/ui/skeleton';
import { AuthAlert } from '@/client/features/auth/components/auth-alert';
import { AuthLayout } from '@/client/features/auth/components/auth-layout';
import { ResetPasswordForm } from '@/client/features/auth/components/reset-password-form';
import { useResetTokenCheck } from '@/client/features/auth/hooks/use-reset-password';

type ResetPasswordFeaturePageProps = {
  token: string;
  boards: PublicBillboard[];
};

export function ResetPasswordFeaturePage({ token, boards }: ResetPasswordFeaturePageProps) {
  // Checked up front so an expired link says so immediately, instead of after
  // the user has picked and confirmed a password.
  const tokenCheck = useResetTokenCheck(token);

  return (
    <AuthLayout
      boards={boards}
      eyebrow="Account recovery"
      title="Choose a new password"
      description="Pick something you have not used on this account before. You will stay signed out on other devices until you sign in again."
      footer={
        <p className="text-muted-foreground text-sm">
          Changed your mind?{' '}
          <Link
            href="/login"
            className="text-primary focus-visible:ring-ring/50 rounded font-semibold hover:underline focus-visible:ring-3 focus-visible:outline-none"
          >
            Back to sign in
          </Link>
        </p>
      }
    >
      {tokenCheck.isPending ? (
        <div className="space-y-5" aria-busy="true">
          <span className="sr-only" role="status">
            Checking your reset link
          </span>
          <Skeleton className="h-[4.75rem] w-full rounded-xl" />
          <Skeleton className="h-[4.75rem] w-full rounded-xl" />
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>
      ) : tokenCheck.data ? (
        <ResetPasswordForm token={token} />
      ) : (
        <div className="space-y-5">
          <AuthAlert title="This reset link is no longer valid">
            Reset links expire after one hour and can only be used once. Request a fresh one and we
            will email it right away.
          </AuthAlert>

          <Button
            render={<Link href="/forgot-password" />}
            nativeButton={false}
            className="h-11 w-full gap-2 rounded-xl text-sm font-semibold"
          >
            <LinkIcon className="size-4" aria-hidden />
            Request a new link
          </Button>
        </div>
      )}
    </AuthLayout>
  );
}
