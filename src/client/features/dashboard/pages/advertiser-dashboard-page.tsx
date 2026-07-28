'use client';

import Link from 'next/link';
import {
  AlertCircle,
  CalendarCheck,
  FileImage,
  Loader2,
  Megaphone,
  Receipt,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/client/ui/components/ui/button';
import { ADVERTISER_ROUTES } from '@/shared/constants/routes';
import { BOOKING_STATUSES } from '@/shared/constants/booking';
import { useAdvertiserWorkspace } from '@/client/features/dashboard/hooks/use-advertiser-workspace';
import {
  EmptyState,
  StatCard,
  WorkspacePage,
} from '@/client/features/dashboard/components/workspace-page';
import {
  countActiveCampaigns,
  countApprovedCreatives,
  formatDate,
  formatTotals,
  outstandingBookings,
  sumByCurrency,
} from '@/client/features/dashboard/utils/advertiser-metrics';

export function AdvertiserDashboardFeaturePage() {
  const { bookings, campaigns, creatives, status, error, reload } = useAdvertiserWorkspace();

  const pending = bookings.filter((booking) => booking.status === BOOKING_STATUSES.PENDING);
  const outstanding = outstandingBookings(bookings);
  const upcoming = [...bookings]
    .filter((booking) => booking.status !== BOOKING_STATUSES.CANCELLED)
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .slice(0, 5);

  return (
    <WorkspacePage
      title="Dashboard"
      description="Everything running across your campaigns, reservations, and creatives."
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
          Loading your workspace...
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={Megaphone}
              label="Active campaigns"
              value={String(countActiveCampaigns(campaigns))}
              hint={`${campaigns.length} total`}
            />
            <StatCard
              icon={CalendarCheck}
              label="Reservations"
              value={String(bookings.length)}
              hint={`${pending.length} awaiting approval`}
            />
            <StatCard
              icon={FileImage}
              label="Approved creatives"
              value={String(countApprovedCreatives(creatives))}
              hint={`${creatives.length} uploaded`}
            />
            <StatCard
              icon={Receipt}
              label="Outstanding"
              value={formatTotals(sumByCurrency(outstanding))}
              hint={`${outstanding.length} unpaid reservation(s)`}
            />
          </div>

          <div>
            <div className="mb-3 flex items-end justify-between gap-4">
              <h2 className="text-lg font-semibold tracking-tight">Upcoming reservations</h2>
              <Link
                href={ADVERTISER_ROUTES.BOOKINGS}
                className="text-primary text-sm font-medium hover:underline"
              >
                View all
              </Link>
            </div>

            {upcoming.length === 0 ? (
              <EmptyState
                icon={CalendarCheck}
                title="No reservations yet"
                description="Browse the billboard marketplace and reserve your first placement."
                action={
                  <Button
                    render={<Link href={ADVERTISER_ROUTES.BILLBOARDS} />}
                    nativeButton={false}
                  >
                    Browse billboards
                  </Button>
                }
              />
            ) : (
              <ul className="bg-card divide-y rounded-xl border">
                {upcoming.map((booking) => (
                  <li
                    key={booking.id}
                    className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{booking.campaignName}</p>
                      <p className="text-muted-foreground mt-0.5 text-xs">
                        {formatDate(booking.startDate)} → {formatDate(booking.endDate)} ·{' '}
                        {booking.reference}
                      </p>
                    </div>
                    <span className="text-muted-foreground text-xs font-medium capitalize">
                      {booking.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </WorkspacePage>
  );
}
