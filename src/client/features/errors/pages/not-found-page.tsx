import Link from 'next/link';
import { ArrowLeft, MapPinOff } from 'lucide-react';
import { Button } from '@/client/ui/components/ui/button';

export function NotFoundFeaturePage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-zinc-50 px-5 py-16">
      <section className="w-full max-w-xl text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <MapPinOff className="size-6" aria-hidden />
        </span>
        <p className="mt-6 text-sm font-semibold tracking-[0.14em] text-blue-600 uppercase">404</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.045em] text-balance text-zinc-950 sm:text-5xl">
          This location is not on the map
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base leading-7 text-zinc-500">
          The page may have moved, or the billboard is no longer part of the public inventory.
        </p>
        <Button
          render={<Link href="/billboards" />}
          nativeButton={false}
          className="mt-8 min-h-11 rounded-xl bg-blue-600 px-5 text-white hover:bg-blue-700"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Browse billboards
        </Button>
      </section>
    </main>
  );
}
