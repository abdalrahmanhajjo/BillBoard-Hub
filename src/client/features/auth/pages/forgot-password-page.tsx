import Link from 'next/link';
import type { PublicBillboard } from '@/shared/types/billboard';
import { AuthLayout } from '@/client/features/auth/components/auth-layout';
import { ForgotPasswordForm } from '@/client/features/auth/components/forgot-password-form';

type ForgotPasswordFeaturePageProps = {
  boards: PublicBillboard[];
};

export function ForgotPasswordFeaturePage({ boards }: ForgotPasswordFeaturePageProps) {
  return (
    <AuthLayout
      boards={boards}
      eyebrow="Account recovery"
      title="Reset your password"
      description="Enter the email on your account and we will send a single-use link for choosing a new password."
      footer={
        <p className="text-muted-foreground text-sm">
          Remembered it after all?{' '}
          <Link
            href="/login"
            className="text-primary focus-visible:ring-ring/50 rounded font-semibold hover:underline focus-visible:ring-3 focus-visible:outline-none"
          >
            Sign in instead
          </Link>
        </p>
      }
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
