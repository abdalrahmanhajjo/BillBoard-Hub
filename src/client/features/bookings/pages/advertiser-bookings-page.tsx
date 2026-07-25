'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CalendarDays, MapPin, RefreshCw, XCircle } from 'lucide-react';
import { BOOKING_STATUSES } from '@/shared/constants/booking';
import type { Billboard } from '@/shared/types/billboard';
import type { Booking, BookingStatus } from '@/shared/types/booking';
import { billboardClientService } from '@/client/features/billboards/services/billboard-client.service';
import { bookingClientService } from '@/client/features/bookings/services/booking-client.service';

type LoadStatus = 'loading' | 'ready' | 'error';

const STATUS_STYLES: Record<BookingStatus, string> = {
  pending: 'border-amber-200 bg-amber-50 text-amber-700',
  approved: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  rejected: 'border-red-200 bg-red-50 text-red-700',
  completed: 'border-blue-200 bg-blue-50 text-blue-700',
  cancelled: 'border-zinc-200 bg-zinc-100 text-zinc-500',
};

const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const CANCELLABLE: BookingStatus[] = [BOOKING_STATUSES.PENDING, BOOKING_STATUSES.APPROVED];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function AdvertiserBookingsPage() {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [billboards, setBillboards] = useState<Billboard[]>([]);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [refreshing, setRefreshing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    const [bookingsResult, billboardsResult] = await Promise.all([
      bookingClientService.list(),
      billboardClientService.list(),
    ]);
    if (!bookingsResult.ok) {
      setStatus('error');
      return;
    }
    setBookings((bookingsResult.data?.bookings as Booking[] | undefined) ?? []);
    if (billboardsResult.ok) {
      setBillboards((billboardsResult.data?.billboards as Billboard[] | undefined) ?? []);
    }
    setStatus('ready');
  }, []);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        await loadAll();
      } catch {
        if (active) setStatus('error');
      }
    })();
    return () => {
      active = false;
    };
  }, [loadAll]);

  // Reflect status changes immediately when the advertiser returns to the tab.
  useEffect(() => {
    const onFocus = () => {
      void loadAll();
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [loadAll]);

  const billboardsById = useMemo(
    () => new Map(billboards.map((billboard) => [billboard.id, billboard])),
    [billboards],
  );
  const money = useMemo(() => new Intl.NumberFormat('en-US'), []);

  // An approved reservation whose window has passed reads as completed.
  const displayStatus = (booking: Booking): BookingStatus =>
    booking.status === BOOKING_STATUSES.APPROVED && booking.endDate < today
      ? BOOKING_STATUSES.COMPLETED
      : booking.status;

  const handleRefresh = async () => {
    setActionError(null);
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  };

  const handleCancel = async (booking: Booking) => {
    if (!window.confirm(`Cancel reservation ${booking.reference}?`)) return;
    setActionError(null);
    setCancellingId(booking.id);
    const result = await bookingClientService.cancel(booking.id);
    setCancellingId(null);
    if (!result.ok) {
      setActionError(result.error ?? 'Cancelling the reservation failed.');
      return;
    }
    await loadAll();
  };

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">My reservations</h1>
          <p className="text-sm text-zinc-600">
            Track the status of your billboard reservation requests.
          </p>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing || status === 'loading'}
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50"
        >
          <RefreshCw className={`size-4 ${refreshing ? 'animate-spin' : ''}`} aria-hidden />
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </header>

      {actionError ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {actionError}
        </p>
      ) : null}

      {status === 'loading' ? <p className="text-sm text-zinc-600">Loading…</p> : null}
      {status === 'error' ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          Unable to load your reservations.
        </p>
      ) : null}

      {status === 'ready' && bookings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 px-6 py-14 text-center">
          <p className="text-sm text-zinc-500">You have no reservations yet.</p>
          <Link
            href="/billboards"
            className="mt-4 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Browse billboards
          </Link>
        </div>
      ) : null}

      {status === 'ready' && bookings.length > 0 ? (
        <div className="grid gap-4">
          {bookings.map((booking) => {
            const billboard = billboardsById.get(booking.billboardId);
            const shown = displayStatus(booking);
            const canCancel = CANCELLABLE.includes(booking.status) && shown !== 'completed';
            return (
              <article
                key={booking.id}
                className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate text-base font-semibold">{booking.campaignName}</h2>
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-semibold text-zinc-500">
                      {booking.reference}
                    </span>
                  </div>
                  <p className="flex items-center gap-1.5 text-sm text-zinc-500">
                    <MapPin className="size-3.5 text-blue-600" aria-hidden />
                    {billboard ? `${billboard.name} — ${billboard.location.city}` : 'Billboard'}
                  </p>
                  <p className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <CalendarDays className="size-3.5 text-zinc-400" aria-hidden />
                    {formatDate(booking.startDate)} – {formatDate(booking.endDate)} (
                    {booking.pricing.days} days)
                  </p>
                  {shown === 'rejected' ? (
                    <p className="mt-1 text-xs text-red-600">
                      This request was not accepted. You can submit a new reservation with different
                      dates.
                    </p>
                  ) : null}
                </div>

                <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[shown]}`}
                  >
                    {STATUS_LABELS[shown]}
                  </span>
                  <span className="text-sm font-semibold text-zinc-900">
                    {booking.pricing.currency} {money.format(booking.pricing.total)}
                  </span>
                  {canCancel ? (
                    <button
                      type="button"
                      onClick={() => handleCancel(booking)}
                      disabled={cancellingId === booking.id}
                      className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 disabled:opacity-50"
                    >
                      <XCircle className="size-3.5" aria-hidden />
                      {cancellingId === booking.id ? 'Cancelling…' : 'Cancel'}
                    </button>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
