import Link from 'next/link';
import type { PublicBillboard } from '@/shared/types/billboard';
import { AuthLayout } from '@/client/features/auth/components/auth-layout';
import { RegisterForm } from '@/client/features/auth/components/register-form';

type RegisterFeaturePageProps = {
  boards: PublicBillboard[];
};

export function RegisterFeaturePage({ boards }: RegisterFeaturePageProps) {
  return (
    <AuthLayout
      boards={boards}
      eyebrow="Advertiser onboarding"
      title="Create your account"
      description="Request billboard slots, upload creatives, and track every campaign from approval to launch."
      footer={
        <p className="text-muted-foreground text-sm">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-primary focus-visible:ring-ring/50 rounded font-semibold hover:underline focus-visible:ring-3 focus-visible:outline-none"
          >
            Sign in
          </Link>
        </p>
      }
    >
      <RegisterForm />
    </AuthLayout>
  );
}
