import Link from 'next/link';
import { RegisterForm } from '@/client/features/auth/components/register-form';
import { AuthBrandPanel } from '@/client/features/auth/components/auth-brand-panel';
import { ArrowRight } from 'lucide-react';
import { BorderBeam } from '@/client/ui/components/ui/border-beam';

export function RegisterFeaturePage() {
  return (
    <section className="mx-auto grid min-h-[calc(100vh-2rem)] w-full max-w-6xl items-center px-3 py-6 lg:min-h-[760px] lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch lg:px-6">
      <AuthBrandPanel
        title="Launch your next reservation in minutes"
        subtitle="Create an advertiser account to request billboard slots, upload creatives, and track campaign status from approval to launch."
        imageUrl="https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=1200&q=80"
        imageAlt="Digital billboard at an urban intersection"
      />

      <div className="animate-in fade-in slide-in-from-right-4 flex h-full w-full duration-700">
        <div className="relative overflow-hidden flex h-full w-full flex-col rounded-3xl rounded-s-none rounded-l-none bg-white/95 p-6 shadow-xl backdrop-blur-sm sm:p-8">
          <header className="mb-6 space-y-2">
            <p className="text-xs font-semibold tracking-[0.14em] text-blue-600 uppercase">
              Advertiser Onboarding
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">Create account</h1>
            <p className="text-sm text-zinc-600">
              Start as an advertiser and get immediate access to your reservation dashboard.
            </p>
          </header>

          <RegisterForm />

          <p className="mt-6 flex items-center gap-2 text-sm text-zinc-600">
            Already have an account?
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 font-semibold text-blue-700 transition-colors hover:text-blue-600"
            >
              Sign in
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
