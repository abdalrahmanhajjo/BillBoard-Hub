import Link from 'next/link';
import type { PublicBillboard } from '@/shared/types/billboard';
import { AuthLayout } from '@/client/features/auth/components/auth-layout';
import { LoginForm } from '@/client/features/auth/components/login-form';

type LoginFeaturePageProps = {
  boards: PublicBillboard[];
};

export function LoginFeaturePage({ boards }: LoginFeaturePageProps) {
  return (
    <AuthLayout
      boards={boards}
      eyebrow="Welcome back"
      title="Sign in to Boardly"
      description="Manage reservations, approvals, creatives, and campaign performance from a single dashboard."
      footer={
        <p className="text-muted-foreground text-sm">
          New to Boardly?{' '}
          <Link
            href="/register"
            className="text-primary focus-visible:ring-ring/50 rounded font-semibold hover:underline focus-visible:ring-3 focus-visible:outline-none"
          >
            Create an advertiser account
          </Link>
        </p>
      }
    >
      <LoginForm />
    </AuthLayout>
  );
}
