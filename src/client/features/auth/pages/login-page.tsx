import Link from 'next/link';
import LoginForm from '@/client/features/auth/components/login-form';
import { AuthBrandPanel } from '@/client/features/auth/components/auth-brand-panel';
import { ArrowRight } from 'lucide-react';
import { BorderBeam } from '@/client/ui/components/ui/border-beam';

export function LoginFeaturePage() {
  return (
    <section className="mx-auto grid min-h-[calc(100vh-2rem)] w-full max-w-6xl items-center px-3 py-6 lg:min-h-[760px] lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch lg:px-6">
      <AuthBrandPanel
        title="Run high-impact billboard campaigns"
        subtitle="Sign in to manage reservations, approvals, creatives, and campaign performance from one dashboard."
        imageUrl="https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80"
        imageAlt="Billboard and city lights at night"
      />

      <div className="animate-in fade-in slide-in-from-right-4 flex h-full w-full duration-700">
        <div className="relative flex h-full w-full flex-col overflow-hidden rounded-3xl rounded-s-none rounded-l-none bg-white/95 p-6 shadow-xl backdrop-blur-sm sm:p-8">
          <header className="mb-6 space-y-2">
            <p className="text-xs font-semibold tracking-[0.14em] text-blue-600 uppercase">
              Welcome Back
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">Sign in</h1>
            <p className="text-sm text-zinc-600">
              Access your advertiser workspace and continue your reservation flow.
            </p>
          </header>

          <LoginForm />

          <p className="mt-6 flex flex-wrap items-center gap-2 text-sm text-zinc-600">
            New to Boardly?
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 font-semibold text-blue-700 transition-colors hover:text-blue-600"
            >
              Create advertiser account
              <ArrowRight className="h-4 w-4" />
            </Link>
          </p>
          <BorderBeam
            duration={6}
            size={400}
            className="from-transparent via-green-500 to-transparent"
          />
          <BorderBeam
            duration={6}
            delay={3}
            size={400}
            borderWidth={2}
            className="from-transparent via-blue-500 to-transparent"
          />
        </div>
      </div>
    </section>
  );
}
