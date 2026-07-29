'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ArrowRight,
  CalendarCheck,
  CircleDollarSign,
  FileImage,
  Megaphone,
  RefreshCw,
} from 'lucide-react';
import { Badge } from '@/client/ui/components/ui/badge';
import { Button } from '@/client/ui/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/client/ui/components/ui/table';
import { ADVERTISER_ROUTES } from '@/shared/constants/routes';
import { BOOKING_STATUSES } from '@/shared/constants/booking';
import type { Booking } from '@/shared/types/booking';
import { useAdvertiserWorkspace } from '@/client/features/dashboard/hooks/use-advertiser-workspace';
import {
  EmptyState,
  SectionCard,
  StatCard,
  WorkspaceError,
  WorkspacePage,
  WorkspaceSkeleton,
} from '@/client/features/dashboard/components/workspace-page';
import {
  countActiveCampaigns,
  countApprovedCreatives,
  formatCurrency,
  formatDate,
  formatTotals,
  outstandingBookings,
  sumByCurrency,
} from '@/client/features/dashboard/utils/advertiser-metrics';
import {
  BOOKING_STATUS_COLORS,
  monthOverMonth,
  recentBookings,
  spendByMonth,
  statusBreakdown,
  totalCommitted,
  upcomingBookings,
} from '@/client/features/dashboard/utils/advertiser-insights';

function statusBadge(status: Booking['status']) {
  if (status === BOOKING_STATUSES.APPROVED || status === BOOKING_STATUSES.COMPLETED) {
    return <Badge variant="success">{status}</Badge>;
  }
  if (status === BOOKING_STATUSES.PENDING) {
    return (
      <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
        Pending
      </Badge>
    );
  }
  if (status === BOOKING_STATUSES.REJECTED) {
    return (
      <Badge variant="outline" className="border-rose-200 bg-rose-50 text-rose-700">
        Rejected
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-muted-foreground capitalize">
      {status}
    </Badge>
  );
}

function relativeTime(value?: string): string {
  if (!value) return '—';
  const elapsed = new Date(value).getTime() - Date.now();
  if (Number.isNaN(elapsed)) return '—';

  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ['day', 86_400_000],
    ['hour', 3_600_000],
    ['minute', 60_000],
  ];

  for (const [unit, size] of units) {
    const delta = Math.round(elapsed / size);
    if (Math.abs(delta) >= 1) {
      return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(delta, unit);
    }
  }

  return 'just now';
}

export function AdvertiserDashboardFeaturePage() {
  const { bookings, campaigns, creatives, status, error, reload } = useAdvertiserWorkspace();

  const insights = useMemo(() => {
    const spend = spendByMonth(bookings);
    return {
      spend,
      trends: monthOverMonth(spend),
      statuses: statusBreakdown(bookings),
      upcoming: upcomingBookings(bookings),
      recent: recentBookings(bookings, 4),
    };
  }, [bookings]);

  const pending = bookings.filter((booking) => booking.status === BOOKING_STATUSES.PENDING);
  const outstanding = outstandingBookings(bookings);
  const currency = bookings[0]?.pricing?.currency ?? 'USD';
  const committed = totalCommitted(bookings);
  const charted = insights.spend.some((point) => point.spend > 0);

  const actions = (
    <>
      <Button variant="outline" onClick={reload} disabled={status === 'loading'}>
        <RefreshCw
          className={status === 'loading' ? 'size-4 animate-spin' : 'size-4'}
          aria-hidden
        />
        Refresh
      </Button>
      <Button render={<Link href={ADVERTISER_ROUTES.BILLBOARDS} />} nativeButton={false}>
        Book a billboard
        <ArrowRight className="size-4" aria-hidden />
      </Button>
    </>
  );

  return (
    <WorkspacePage
      eyebrow="Overview"
      title="Welcome back. Here's how your campaigns are running."
      description="Live view of your reservations, committed spend, creative approvals, and what needs your attention next."
      actions={actions}
      canvas
    >
      {status === 'loading' ? <WorkspaceSkeleton /> : null}

      {status === 'error' ? (
        <WorkspaceError message={error ?? 'Unknown workspace error.'} onRetry={reload} />
      ) : null}

      {status === 'ready' ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              index={0}
              icon={CircleDollarSign}
              accent="bg-emerald-50 text-emerald-700"
              label="Committed spend"
              value={formatCurrency(committed, currency)}
              trend={
                insights.trends.spend === null
                  ? undefined
                  : { value: insights.trends.spend, label: 'vs last month' }
              }
              hint="All reservations"
            />
            <StatCard
              index={1}
              icon={CalendarCheck}
              accent="bg-blue-50 text-blue-700"
              label="Reservations"
              value={String(bookings.length)}
              trend={
                insights.trends.reservations === null
                  ? undefined
                  : { value: insights.trends.reservations, label: 'vs last month' }
              }
              hint={`${pending.length} awaiting approval`}
            />
            <StatCard
              index={2}
              icon={Megaphone}
              accent="bg-cyan-50 text-cyan-700"
              label="Active campaigns"
              value={String(countActiveCampaigns(campaigns))}
              hint={`${campaigns.length} total`}
            />
            <StatCard
              index={3}
              icon={FileImage}
              accent="bg-amber-50 text-amber-700"
              label="Outstanding"
              value={formatTotals(sumByCurrency(outstanding))}
              hint={`${outstanding.length} unpaid reservation(s)`}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
            <SectionCard
              title="Spend by campaign month"
              description="Reservation value by the month a campaign starts, excluding cancelled and rejected requests."
            >
              {!charted ? (
                <EmptyState
                  icon={CircleDollarSign}
                  title="Nothing scheduled in this window"
                  description="Reservations starting from two months ago through the next nine appear here month by month."
                />
              ) : (
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={insights.spend}
                      margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
                    >
                      <defs>
                        <linearGradient id="advertiserSpend" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#2563eb" stopOpacity={0.35} />
                          <stop offset="100%" stopColor="#2563eb" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis
                        dataKey="label"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 12, fill: '#64748b' }}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        width={48}
                        tick={{ fontSize: 12, fill: '#64748b' }}
                        tickFormatter={(value: number) =>
                          new Intl.NumberFormat('en-US', {
                            notation: 'compact',
                            maximumFractionDigits: 1,
                          }).format(value)
                        }
                      />
                      <Tooltip
                        cursor={{ stroke: '#cbd5f5' }}
                        formatter={(value) => [
                          formatCurrency(Number(value ?? 0), currency),
                          'Spend',
                        ]}
                        contentStyle={{
                          borderRadius: 12,
                          border: '1px solid #e2e8f0',
                          fontSize: 12,
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="spend"
                        stroke="#2563eb"
                        strokeWidth={2}
                        fill="url(#advertiserSpend)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </SectionCard>

            <SectionCard
              title="Reservation status"
              description="Where every request you have made currently stands."
            >
              {insights.statuses.length === 0 ? (
                <EmptyState
                  icon={CalendarCheck}
                  title="Nothing requested yet"
                  description="Your first reservation will show up here."
                />
              ) : (
                <>
                  <div className="h-40 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={insights.statuses}
                          dataKey="count"
                          nameKey="label"
                          innerRadius={44}
                          outerRadius={68}
                          paddingAngle={2}
                          strokeWidth={0}
                        >
                          {insights.statuses.map((slice) => (
                            <Cell
                              key={slice.status}
                              fill={BOOKING_STATUS_COLORS[slice.status] ?? '#94a3b8'}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            borderRadius: 12,
                            border: '1px solid #e2e8f0',
                            fontSize: 12,
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <ul className="mt-3 space-y-1.5">
                    {insights.statuses.map((slice) => (
                      <li key={slice.status} className="flex items-center gap-2 text-sm">
                        <span
                          aria-hidden
                          className="size-2.5 shrink-0 rounded-full"
                          style={{ background: BOOKING_STATUS_COLORS[slice.status] ?? '#94a3b8' }}
                        />
                        <span className="flex-1 truncate">{slice.label}</span>
                        <span className="font-medium tabular-nums">{slice.count}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </SectionCard>
          </div>

          <SectionCard
            title="Upcoming reservations"
            description="Runs that have not finished yet, soonest first."
            action={
              <Link
                href={ADVERTISER_ROUTES.BOOKINGS}
                className="text-primary inline-flex items-center gap-1 text-sm font-medium hover:underline"
              >
                View all
                <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            }
            bodyClassName="px-0 pb-0"
          >
            {insights.upcoming.length === 0 ? (
              <div className="px-5 pb-5">
                <EmptyState
                  icon={CalendarCheck}
                  title="No upcoming reservations"
                  description="Browse the marketplace and reserve your next placement."
                  action={
                    <Button
                      render={<Link href={ADVERTISER_ROUTES.BILLBOARDS} />}
                      nativeButton={false}
                    >
                      Browse billboards
                    </Button>
                  }
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Window</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {insights.upcoming.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <p className="font-medium">{booking.campaignName}</p>
                          <p className="text-muted-foreground font-mono text-xs">
                            {booking.reference}
                          </p>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                          {formatDate(booking.startDate)} → {formatDate(booking.endDate)}
                        </TableCell>
                        <TableCell>{statusBadge(booking.status)}</TableCell>
                        <TableCell className="text-right font-medium tabular-nums">
                          {formatCurrency(
                            booking.pricing?.total ?? 0,
                            booking.pricing?.currency ?? currency,
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </SectionCard>

          <div className="grid gap-4 lg:grid-cols-2">
            <SectionCard title="Recent activity" description="Your latest reservation requests.">
              {insights.recent.length === 0 ? (
                <EmptyState
                  icon={CalendarCheck}
                  title="Nothing yet"
                  description="Activity appears as you submit reservations."
                />
              ) : (
                <ul className="space-y-2.5">
                  {insights.recent.map((booking) => (
                    <li
                      key={booking.id}
                      className="border-border/70 flex gap-3 rounded-xl border p-3"
                    >
                      <span className="mt-1 flex size-2.5 shrink-0 rounded-full bg-blue-600" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <p className="truncate text-sm font-medium">{booking.campaignName}</p>
                          {statusBadge(booking.status)}
                        </div>
                        <p className="text-muted-foreground mt-0.5 text-xs">
                          {formatDate(booking.startDate)} → {formatDate(booking.endDate)}
                        </p>
                        <p className="text-muted-foreground mt-0.5 text-xs">
                          {relativeTime(booking.createdAt)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>

            <SectionCard
              title="Creative library"
              description="Assets available to schedule on your placements."
              action={
                <Link
                  href={ADVERTISER_ROUTES.CREATIVES}
                  className="text-primary inline-flex items-center gap-1 text-sm font-medium hover:underline"
                >
                  Manage
                  <ArrowRight className="size-3.5" aria-hidden />
                </Link>
              }
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="border-border/70 rounded-xl border p-4">
                  <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    Approved
                  </p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums">
                    {countApprovedCreatives(creatives)}
                  </p>
                </div>
                <div className="border-border/70 rounded-xl border p-4">
                  <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    Uploaded
                  </p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums">{creatives.length}</p>
                </div>
              </div>
              {creatives.length === 0 ? (
                <p className="text-muted-foreground mt-3 text-xs leading-relaxed">
                  Upload a creative so it can be reviewed before your campaign starts.
                </p>
              ) : null}
            </SectionCard>
          </div>
        </div>
      ) : null}
    </WorkspacePage>
  );
}
