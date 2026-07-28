'use client';

import { AlertCircle, CalendarCheck, Eye, Loader2, Megaphone, RefreshCw } from 'lucide-react';
import { Button } from '@/client/ui/components/ui/button';
import { BOOKING_STATUSES } from '@/shared/constants/booking';
import { CAMPAIGN_STATUSES } from '@/shared/constants/campaign';
import type { BookingStatus } from '@/shared/types/booking';
import { useAdvertiserWorkspace } from '@/client/features/dashboard/hooks/use-advertiser-workspace';
import { useAdvertiserDelivery } from '@/client/features/analytics/hooks/use-advertiser-delivery';
import { StatCard, WorkspacePage } from '@/client/features/dashboard/components/workspace-page';
import {
  countBy,
  formatTotals,
  sumByCurrency,
} from '@/client/features/dashboard/utils/advertiser-metrics';

const BOOKING_STATUS_ORDER: BookingStatus[] = [
  BOOKING_STATUSES.PENDING,
  BOOKING_STATUSES.APPROVED,
  BOOKING_STATUSES.COMPLETED,
  BOOKING_STATUSES.REJECTED,
  BOOKING_STATUSES.CANCELLED,
];

const BOOKING_STATUS_BARS: Record<BookingStatus, string> = {
  pending: 'bg-amber-500',
  approved: 'bg-emerald-500',
  completed: 'bg-blue-500',
  rejected: 'bg-rose-500',
  cancelled: 'bg-zinc-400',
};

/**
 * Combines two sources: spend and pipeline derived from the advertiser's own
 * reservations, campaigns, and creatives, plus delivery counts from the
 * impressions endpoint, which scopes results to the caller server-side.
 */
export function AdvertiserReportsFeaturePage() {
  const { bookings, campaigns, creatives, status, error, reload } = useAdvertiserWorkspace();
  const { delivery, isLoading: deliveryLoading, error: deliveryError } = useAdvertiserDelivery();

  const byStatus = countBy(bookings, (booking) => booking.status);
  const settled = bookings.filter(
    (booking) =>
      booking.status === BOOKING_STATUSES.APPROVED || booking.status === BOOKING_STATUSES.COMPLETED,
  );
  const totalDays = settled.reduce((sum, booking) => sum + (booking.pricing?.days ?? 0), 0);

  const campaignCounts = countBy(campaigns, (campaign) => campaign.status);

  return (
    <WorkspacePage
      title="Reports"
      description="Delivery, committed spend, and pipeline across everything you have booked."
      actions={
        <Button variant="outline" onClick={reload} disabled={status === 'loading'}>
          <RefreshCw
            className={status === 'loading' ? 'size-4 animate-spin' : 'size-4'}
            aria-hidden
          />
          Refresh
        </Button>
      }
    >
      {status === 'error' ? (
        <div
          role="alert"
          className="border-destructive/30 bg-destructive/8 text-destructive mb-6 flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>{error}</span>
        </div>
      ) : null}

      {status === 'loading' ? (
        <div className="text-muted-foreground flex items-center gap-2 py-16 text-sm">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Building reports...
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={CalendarCheck}
              label="Committed spend"
              value={formatTotals(sumByCurrency(settled))}
              hint="Approved and completed"
            />
            <StatCard
              icon={CalendarCheck}
              label="Booked days"
              value={String(totalDays)}
              hint="Across live reservations"
            />
            <StatCard
              icon={Megaphone}
              label="Campaigns"
              value={String(campaigns.length)}
              hint={`${campaignCounts[CAMPAIGN_STATUSES.ACTIVE] ?? 0} active`}
            />
            <StatCard
              icon={Eye}
              label="Plays delivered"
              value={deliveryLoading ? '—' : delivery.total.toLocaleString('en-US')}
              hint={
                deliveryError ? 'Delivery unavailable' : `${creatives.length} creatives uploaded`
              }
            />
          </div>

          <section className="bg-card rounded-xl border p-5">
            <h2 className="text-base font-semibold tracking-tight">Delivery by creative</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Plays recorded by the screens running your creatives.
            </p>

            {deliveryLoading ? (
              <p className="text-muted-foreground mt-4 flex items-center gap-2 text-sm">
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Loading delivery...
              </p>
            ) : deliveryError ? (
              <p className="text-muted-foreground mt-4 text-sm">{deliveryError}</p>
            ) : delivery.byCreative.length === 0 ? (
              <p className="text-muted-foreground mt-4 text-sm">
                No plays recorded yet. Figures appear here once a screen reports your creative
                running.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {delivery.byCreative.map((row) => {
                  const share = delivery.total === 0 ? 0 : (row.count / delivery.total) * 100;

                  return (
                    <li key={row.creativeId}>
                      <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                        <span className="truncate font-medium">{row.name}</span>
                        <span className="text-muted-foreground shrink-0">
                          {row.count.toLocaleString('en-US')} · {share.toFixed(0)}%
                        </span>
                      </div>
                      <div className="bg-muted h-2 overflow-hidden rounded-full">
                        <div
                          className="h-full rounded-full bg-blue-500"
                          style={{ width: `${share}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="bg-card rounded-xl border p-5">
            <h2 className="text-base font-semibold tracking-tight">Reservations by status</h2>
            {bookings.length === 0 ? (
              <p className="text-muted-foreground mt-3 text-sm">
                No reservations yet — this breakdown fills in once you book a placement.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {BOOKING_STATUS_ORDER.map((bookingStatus) => {
                  const count = byStatus[bookingStatus] ?? 0;
                  const share = bookings.length === 0 ? 0 : (count / bookings.length) * 100;

                  return (
                    <li key={bookingStatus}>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="font-medium capitalize">{bookingStatus}</span>
                        <span className="text-muted-foreground">
                          {count} · {share.toFixed(0)}%
                        </span>
                      </div>
                      <div className="bg-muted h-2 overflow-hidden rounded-full">
                        <div
                          className={`h-full rounded-full ${BOOKING_STATUS_BARS[bookingStatus]}`}
                          style={{ width: `${share}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <p className="text-muted-foreground text-xs">
            Spend and pipeline are calculated from your reservations, campaigns, and creatives.
            Delivery counts come from plays reported by the screens themselves and cover only your
            own creatives.
          </p>
        </div>
      )}
    </WorkspacePage>
  );
}
