'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  Loader2,
  MapPin,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import { BOOKING_STATUSES, PAYMENT_METHODS, PAYMENT_STATUSES } from '@/shared/constants/booking';
import type { Billboard } from '@/shared/types/billboard';
import type { Booking, BookingStatus, PaymentMethod, PaymentStatus } from '@/shared/types/booking';
import { billboardClientService } from '@/client/features/billboards/services/billboard-client.service';
import { bookingClientService } from '@/client/features/bookings/services/booking-client.service';
import { paymentClientService } from '@/client/features/payments/services/payment-client.service';
import {
  EmptyState,
  StatCard,
  WorkspaceError,
  WorkspacePage,
} from '@/client/features/dashboard/components/workspace-page';
import { Button } from '@/client/ui/components/ui/button';
import { Skeleton } from '@/client/ui/components/ui/skeleton';

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

const PAYMENT_STYLES: Record<PaymentStatus, string> = {
  pending: 'border-amber-200 bg-amber-50 text-amber-700',
  paid: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  partially_paid: 'border-sky-200 bg-sky-50 text-sky-700',
  unpaid: 'border-rose-200 bg-rose-50 text-rose-700',
  refund_pending: 'border-violet-200 bg-violet-50 text-violet-700',
  refunded: 'border-zinc-200 bg-zinc-100 text-zinc-600',
};

const PAYMENT_LABELS: Record<PaymentStatus, string> = {
  pending: 'Payment due',
  paid: 'Paid',
  partially_paid: 'Partially paid',
  unpaid: 'Payment due',
  refund_pending: 'Refund processing',
  refunded: 'Refunded',
};

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  card: 'Visa · Stripe',
  bank_transfer: 'Bank transfer',
  e_wallet: 'Cash / Whish',
  cash: 'Cash',
};

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
  const [payingId, setPayingId] = useState<string | null>(null);

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
    void (async () => {
      await loadAll();
    })();
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
    if (
      !window.confirm(
        `Cancel reservation ${booking.reference}? The requested dates will be released. This cannot be undone.`,
      )
    )
      return;
    setActionError(null);
    setCancellingId(booking.id);
    const result = await bookingClientService.cancel(booking.id);
    setCancellingId(null);
    if (!result.ok) {
      setActionError(
        result.error ?? 'We could not cancel this reservation. Refresh the page and try again.',
      );
      return;
    }
    await loadAll();
  };

  const handlePay = async (booking: Booking) => {
    setActionError(null);
    setPayingId(booking.id);
    const result = await paymentClientService.createCheckoutSession(booking.id);
    if (!result.ok || !result.data?.url) {
      setPayingId(null);
      setActionError(
        result.error ??
          'We could not start secure card checkout. Refresh the reservation and try again.',
      );
      return;
    }
    window.location.assign(result.data.url);
  };

  const awaiting = bookings.filter((booking) => booking.status === BOOKING_STATUSES.PENDING).length;
  const live = bookings.filter(
    (booking) => booking.status === BOOKING_STATUSES.APPROVED && booking.endDate >= today,
  ).length;
  const duePayment = bookings.filter(
    (booking) =>
      booking.status === BOOKING_STATUSES.APPROVED &&
      (booking.paymentStatus === PAYMENT_STATUSES.PENDING ||
        booking.paymentStatus === PAYMENT_STATUSES.UNPAID),
  ).length;

  return (
    <WorkspacePage
      eyebrow="Commercial"
      title="My reservations"
      description="Track every billboard reservation request, its approval state, and what still needs paying."
      actions={
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={refreshing || status === 'loading'}
        >
          <RefreshCw className={refreshing ? 'size-4 animate-spin' : 'size-4'} aria-hidden />
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </Button>
      }
      canvas
    >
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          index={0}
          icon={CalendarDays}
          accent="bg-blue-50 text-blue-700"
          label="Reservations"
          value={String(bookings.length)}
          hint="All requests"
        />
        <StatCard
          index={1}
          icon={Clock3}
          accent="bg-amber-50 text-amber-700"
          label="Awaiting approval"
          value={String(awaiting)}
          hint="With our team"
        />
        <StatCard
          index={2}
          icon={CheckCircle2}
          accent="bg-emerald-50 text-emerald-700"
          label="Approved & upcoming"
          value={String(live)}
          hint="Dates are held"
        />
        <StatCard
          index={3}
          icon={CreditCard}
          accent="bg-rose-50 text-rose-700"
          label="Payment due"
          value={String(duePayment)}
          hint="Ready to pay"
        />
      </div>

      {actionError ? (
        <p
          role="alert"
          className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {actionError}
        </p>
      ) : null}

      {status === 'loading' ? (
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-40 w-full rounded-2xl" />
          ))}
        </div>
      ) : null}

      {status === 'error' ? (
        <WorkspaceError
          message="We could not load your reservations. Check your connection and try again."
          onRetry={() => void handleRefresh()}
        />
      ) : null}

      {status === 'ready' && bookings.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No reservations yet"
          description="Browse the marketplace and reserve your first placement."
          action={
            <Button render={<Link href="/billboards" />} nativeButton={false}>
              Browse billboards
            </Button>
          }
        />
      ) : null}

      {status === 'ready' && bookings.length > 0 ? (
        <div className="grid gap-4">
          {bookings.map((booking) => {
            const billboard = billboardsById.get(booking.billboardId);
            const shown = displayStatus(booking);
            const hasReceivedPayment =
              booking.paymentStatus === PAYMENT_STATUSES.PAID ||
              booking.paymentStatus === PAYMENT_STATUSES.PARTIALLY_PAID ||
              booking.paymentStatus === PAYMENT_STATUSES.REFUND_PENDING;
            const canCancel =
              CANCELLABLE.includes(booking.status) && shown !== 'completed' && !hasReceivedPayment;
            const canPay =
              booking.paymentMethod === PAYMENT_METHODS.CARD &&
              booking.status === BOOKING_STATUSES.APPROVED &&
              (booking.paymentStatus === PAYMENT_STATUSES.PENDING ||
                booking.paymentStatus === PAYMENT_STATUSES.UNPAID);
            return (
              <article
                key={booking.id}
                className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm"
              >
                <div className="grid gap-5 p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
                  <div className="min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate text-base font-semibold">{booking.campaignName}</h2>
                      <span className="rounded-lg bg-zinc-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-zinc-500">
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
                      <p className="mt-2 text-xs text-red-600">
                        This request was not accepted. You can submit a new reservation with
                        different dates.
                      </p>
                    ) : null}
                    {booking.status === BOOKING_STATUSES.PENDING &&
                    booking.paymentMethod === PAYMENT_METHODS.CARD ? (
                      <p className="mt-2 text-xs text-amber-700">
                        Card payment opens after our team confirms availability and approves the
                        reservation.
                      </p>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:max-w-56 sm:justify-end">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[shown]}`}
                    >
                      {STATUS_LABELS[shown]}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${PAYMENT_STYLES[booking.paymentStatus]}`}
                    >
                      {booking.paymentStatus === PAYMENT_STATUSES.PAID ? (
                        <CheckCircle2 className="mr-1 size-3.5" aria-hidden />
                      ) : null}
                      {PAYMENT_LABELS[booking.paymentStatus]}
                    </span>
                    <p className="w-full text-right text-xs text-zinc-500">
                      {PAYMENT_METHOD_LABELS[booking.paymentMethod]}
                    </p>
                    <span className="w-full text-right text-xl font-semibold tracking-tight text-zinc-900 tabular-nums">
                      {booking.pricing.currency} {money.format(booking.pricing.total)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 border-t border-zinc-100 bg-zinc-50/70 px-5 py-3 sm:flex-row sm:items-center sm:justify-end">
                  {canCancel ? (
                    <button
                      type="button"
                      onClick={() => handleCancel(booking)}
                      disabled={cancellingId === booking.id || payingId === booking.id}
                      className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-medium text-zinc-600 transition-colors hover:bg-white disabled:opacity-50"
                    >
                      <XCircle className="size-3.5" aria-hidden />
                      {cancellingId === booking.id ? 'Cancelling…' : 'Cancel reservation'}
                    </button>
                  ) : null}
                  {canPay ? (
                    <button
                      type="button"
                      onClick={() => void handlePay(booking)}
                      disabled={payingId === booking.id}
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
                    >
                      {payingId === booking.id ? (
                        <Loader2 className="size-4 animate-spin" aria-hidden />
                      ) : (
                        <CreditCard className="size-4" aria-hidden />
                      )}
                      {payingId === booking.id ? 'Opening secure checkout…' : 'Pay securely'}
                    </button>
                  ) : null}
                  {booking.paymentStatus === PAYMENT_STATUSES.PAID ? (
                    <span className="inline-flex min-h-10 items-center justify-center gap-2 px-3 text-xs font-medium text-emerald-700">
                      <CheckCircle2 className="size-4" aria-hidden />
                      Payment complete
                    </span>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      ) : null}
    </WorkspacePage>
  );
}
