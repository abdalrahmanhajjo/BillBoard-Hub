'use client';

import { useReservations } from '../hooks/use-reservations';

export function AdvertiserReservationsPage() {
  const { reservations } = useReservations();

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-10">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">My Reservations</h1>

        <p className="text-muted-foreground">
          Manage and track all of your billboard reservations.
        </p>
      </header>

      <div className="rounded-xl border p-8">{reservations.length} reservations loaded.</div>
    </section>
  );
}
