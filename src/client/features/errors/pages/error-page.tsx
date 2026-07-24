'use client';

import { RotateCcw, TriangleAlert } from 'lucide-react';
import { Button } from '@/client/ui/components/ui/button';

export function ErrorFeaturePage({ reset }: { reset: () => void }) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-zinc-50 px-5 py-16">
      <section className="w-full max-w-xl text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <TriangleAlert className="size-6" aria-hidden />
        </span>
        <h1 className="mt-6 text-4xl font-semibold tracking-[-0.045em] text-balance text-zinc-950">
          We could not load this page
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base leading-7 text-zinc-500">
          Your data is safe. Try the request again, or return later if the service is unavailable.
        </p>
        <Button
          type="button"
          onClick={reset}
          className="mt-8 min-h-11 rounded-xl bg-blue-600 px-5 text-white hover:bg-blue-700"
        >
          <RotateCcw className="size-4" aria-hidden />
          Try again
        </Button>
      </section>
    </main>
  );
}
