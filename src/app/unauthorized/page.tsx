import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ShieldX } from 'lucide-react';
import { PRIVATE_ROUTE_METADATA } from '@/shared/seo/metadata';
import { Button } from '@/client/ui/components/ui/button';

export const metadata: Metadata = PRIVATE_ROUTE_METADATA;

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-zinc-50 px-5 py-16">
      <section className="w-full max-w-xl text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
          <ShieldX className="size-6" aria-hidden />
        </span>
        <h1 className="mt-6 text-4xl font-semibold tracking-[-0.045em] text-balance text-zinc-950">
          This area is not available to your account
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base leading-7 text-zinc-500">
          Return to your dashboard, or ask an administrator if your role should include this access.
        </p>
        <Button
          render={<Link href="/user" />}
          nativeButton={false}
          className="mt-8 min-h-11 rounded-xl bg-blue-600 px-5 text-white hover:bg-blue-700"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Return to dashboard
        </Button>
      </section>
    </main>
  );
}
