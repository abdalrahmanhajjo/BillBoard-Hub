'use client';

import Link from 'next/link';
import { startTransition, useDeferredValue, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { motion, useReducedMotion } from 'motion/react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from 'recharts';
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Building2,
  CalendarClock,
  CircleDollarSign,
  Clock3,
  Layers3,
  MapPinned,
  MonitorPlay,
  RadioTower,
  Search,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { useAdminDashboardOverview } from '@/client/features/dashboard/hooks/use-admin-dashboard-overview';
import { Avatar, AvatarFallback } from '@/client/ui/components/ui/avatar';
import { Badge } from '@/client/ui/components/ui/badge';
import { Button } from '@/client/ui/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/client/ui/components/ui/card';
import { Input } from '@/client/ui/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/client/ui/components/ui/select';
import { Skeleton } from '@/client/ui/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/client/ui/components/ui/table';
import { cn } from '@/client/ui/lib/utils';
import type {
  DashboardMetric,
  InventoryStatusPoint,
  PendingApprovalItem,
  RecentActivityItem,
  RecentReservationItem,
  TopLocationRow,
} from '@/shared/types/dashboard';
import type { BookingStatus } from '@/shared/types/booking';

const CARD_SHELL =
  'border-border/70 bg-background/90 shadow-[0_24px_60px_-34px_rgba(15,23,42,0.35)] backdrop-blur-sm';

const QUICK_ACCESS = [
  {
    label: 'Billboards',
    description: 'Manage your live inventory and pricing.',
    href: '/user/admin/billboards',
    icon: RadioTower,
  },
  {
    label: 'Reservations',
    description: 'Review requests and keep fulfillment on track.',
    href: '/user/admin/bookings',
    icon: CalendarClock,
  },
  {
    label: 'Advertisers',
    description: 'Monitor advertiser onboarding and account health.',
    href: '/user/admin/advertisers',
    icon: Building2,
  },
  {
    label: 'Users',
    description: 'Control platform access and user lifecycle.',
    href: '/user/admin/users',
    icon: UserRound,
  },
  {
    label: 'Playlists',
    description: 'Sequence creative rotations for digital screens.',
    href: '/user/admin/playlists',
    icon: Layers3,
  },
  {
    label: 'Schedules',
    description: 'Coordinate digital runs and screen timing.',
    href: '/user/admin/schedules',
    icon: MonitorPlay,
  },
] as const;

const INVENTORY_LABELS: Record<InventoryStatusPoint['status'], string> = {
  available: 'Live',
  reserved: 'Booked',
  occupied: 'Occupied',
  maintenance: 'Maintenance',
};

const INVENTORY_COLORS: Record<InventoryStatusPoint['status'], string> = {
  available: '#2563eb',
  reserved: '#38bdf8',
  occupied: '#22c55e',
  maintenance: '#f59e0b',
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: value < 1000 ? 0 : 1,
  }).format(value);
}

function formatPercent(value: number) {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

function toNumericValue(value: number | string | undefined) {
  return typeof value === 'number' ? value : Number(value ?? 0);
}

function formatRelativeTime(value: string) {
  const elapsed = new Date(value).getTime() - Date.now();
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

function initialsFrom(value: string) {
  return value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((token) => token[0]?.toUpperCase() ?? '')
    .join('');
}

function bookingStatusBadge(status: BookingStatus) {
  if (status === 'approved' || status === 'completed') {
    return <Badge variant="success">{status}</Badge>;
  }

  if (status === 'pending') {
    return (
      <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
        Pending
      </Badge>
    );
  }

  if (status === 'rejected') {
    return (
      <Badge variant="outline" className="border-rose-200 bg-rose-50 text-rose-700">
        Rejected
      </Badge>
    );
  }

  return <Badge variant="muted">{status}</Badge>;
}

function MetricDelta({ metric }: { metric: DashboardMetric }) {
  const isPositive = metric.trend === 'up';
  const isNegative = metric.trend === 'down';
  const DeltaIcon = isNegative ? ArrowDownRight : ArrowUpRight;

  return (
    <div className="flex items-center gap-2 text-xs text-slate-500">
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-full px-2 py-1 font-medium',
          isPositive && 'bg-emerald-50 text-emerald-700',
          isNegative && 'bg-rose-50 text-rose-700',
          metric.trend === 'flat' && 'bg-slate-100 text-slate-600',
        )}
      >
        <DeltaIcon className="size-3" />
        {formatPercent(metric.change)}
      </span>
      <span>{metric.comparisonLabel}</span>
    </div>
  );
}

function EmptyList({ message }: { message: string }) {
  return (
    <div className="flex min-h-32 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 text-center text-sm text-slate-500">
      {message}
    </div>
  );
}

const topLocationsColumns: ColumnDef<TopLocationRow>[] = [
  {
    accessorKey: 'name',
    header: 'Location',
    cell: ({ row }) => (
      <div>
        <p className="font-medium text-slate-900">{row.original.name}</p>
        <p className="text-xs text-slate-500">{row.original.city}</p>
      </div>
    ),
  },
  {
    accessorKey: 'reservations',
    header: 'Reservations',
    cell: ({ row }) => row.original.reservations,
  },
  {
    accessorKey: 'revenue',
    header: 'Revenue',
    cell: ({ row }) => formatCurrency(row.original.revenue),
  },
];

function AdminDashboardSkeleton() {
  return (
    <section className="min-h-[calc(100vh-var(--header-height))] bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.12),transparent_30%),linear-gradient(180deg,#f8fbff_0%,#ffffff_45%)]">
      <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-10 w-80" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-10 w-72 rounded-xl" />
            <Skeleton className="h-10 w-32 rounded-xl" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className={CARD_SHELL}>
              <CardHeader className="space-y-3">
                <Skeleton className="h-10 w-10 rounded-2xl" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          <Skeleton className="h-96 rounded-3xl" />
          <Skeleton className="h-96 rounded-3xl" />
        </div>
      </div>
    </section>
  );
}

function AdminDashboardError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <section className="min-h-[calc(100vh-var(--header-height))] bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.12),transparent_30%),linear-gradient(180deg,#f8fbff_0%,#ffffff_45%)] px-4 py-8 sm:px-6 lg:px-8">
      <Card className={cn(CARD_SHELL, 'mx-auto max-w-2xl rounded-[28px]')}>
        <CardHeader>
          <Badge variant="outline" className="w-fit border-rose-200 bg-rose-50 text-rose-700">
            Dashboard unavailable
          </Badge>
          <CardTitle className="text-2xl">The admin overview could not be loaded.</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            Check the new dashboard overview endpoint or retry after the next refresh cycle.
          </p>
          <Button onClick={onRetry}>Retry</Button>
        </CardContent>
      </Card>
    </section>
  );
}

function PendingApprovalCard({ item }: { item: PendingApprovalItem }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white/85 p-3 shadow-sm shadow-slate-200/40">
      <Avatar className="mt-0.5 size-11 rounded-2xl border border-slate-100 bg-slate-50">
        <AvatarFallback className="rounded-2xl bg-blue-50 text-blue-700">
          {initialsFrom(item.companyName)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="truncate font-medium text-slate-900">{item.companyName}</p>
            <p className="text-xs text-slate-500">
              {item.billboardName} · {item.city}
            </p>
          </div>
          <p className="text-sm font-semibold text-slate-900">{formatCurrency(item.amount)}</p>
        </div>
        <p className="text-sm text-slate-700">{item.campaignName}</p>
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            {item.startDate} to {item.endDate}
          </p>
          <Link
            href="/user/admin/bookings"
            className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 transition hover:text-blue-700"
          >
            Review
            <ArrowRight className="size-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function ReservationRow({ item }: { item: RecentReservationItem }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white/80 p-3 shadow-sm shadow-slate-200/30">
      <Avatar className="mt-0.5 size-11 rounded-2xl border border-slate-100 bg-slate-50">
        <AvatarFallback className="rounded-2xl bg-slate-100 text-slate-700">
          {initialsFrom(item.companyName)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="truncate font-medium text-slate-900">{item.companyName}</p>
            <p className="text-xs text-slate-500">
              {item.billboardName} · {item.city}
            </p>
          </div>
          {bookingStatusBadge(item.status)}
        </div>
        <div className="flex items-center justify-between gap-3 text-sm text-slate-700">
          <p className="truncate">{item.campaignName}</p>
          <p className="font-semibold text-slate-900">{formatCurrency(item.amount)}</p>
        </div>
      </div>
    </div>
  );
}

function ActivityRow({ item }: { item: RecentActivityItem }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-slate-100 bg-white/80 p-3 shadow-sm shadow-slate-200/30">
      <div className="flex w-6 justify-center pt-1">
        <span className="relative flex size-3.5">
          <span className="absolute inset-0 rounded-full bg-blue-200/80" />
          <span className="relative rounded-full border border-white bg-blue-600 p-1" />
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <p className="font-medium text-slate-900">{item.title}</p>
          {bookingStatusBadge(item.status)}
        </div>
        <p className="text-sm text-slate-600">{item.description}</p>
        <p className="mt-1 text-xs text-slate-500">{formatRelativeTime(item.timestamp)}</p>
      </div>
    </div>
  );
}

export function AdminDashboardFeaturePage() {
  const shouldReduceMotion = useReducedMotion();
  const { data, isLoading, isError, error, refetch } = useAdminDashboardOverview();
  const [period, setPeriod] = useState('this-month');
  const [searchValue, setSearchValue] = useState('');
  const deferredSearch = useDeferredValue(searchValue.trim().toLowerCase());

  const filteredTopLocations = (data?.topLocations ?? []).filter((location) => {
    if (!deferredSearch) return true;

    return `${location.name} ${location.city}`.toLowerCase().includes(deferredSearch);
  });

  const topLocationsTable = useReactTable({
    data: filteredTopLocations,
    columns: topLocationsColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return <AdminDashboardSkeleton />;
  }

  if (isError || !data) {
    return (
      <AdminDashboardError
        message={error instanceof Error ? error.message : 'Unknown dashboard error.'}
        onRetry={() => void refetch()}
      />
    );
  }

  const filteredPendingApprovals = data.pendingApprovalsList.filter((item) => {
    if (!deferredSearch) return true;

    return `${item.companyName} ${item.campaignName} ${item.billboardName} ${item.city}`
      .toLowerCase()
      .includes(deferredSearch);
  });

  const filteredReservations = data.recentReservations.filter((item) => {
    if (!deferredSearch) return true;

    return `${item.companyName} ${item.campaignName} ${item.billboardName} ${item.city}`
      .toLowerCase()
      .includes(deferredSearch);
  });

  const filteredActivity = data.recentActivity.filter((item) => {
    if (!deferredSearch) return true;

    return `${item.title} ${item.description}`.toLowerCase().includes(deferredSearch);
  });

  const summaryCards = [
    {
      title: 'Total Billboards',
      value: formatCompactNumber(data.metrics.totalBillboards.value),
      metric: data.metrics.totalBillboards,
      icon: RadioTower,
      iconClassName: 'bg-blue-50 text-blue-700',
    },
    {
      title: 'Active Reservations',
      value: formatCompactNumber(data.metrics.activeReservations.value),
      metric: data.metrics.activeReservations,
      icon: CalendarClock,
      iconClassName: 'bg-cyan-50 text-cyan-700',
    },
    {
      title: 'Revenue (This Month)',
      value: formatCurrency(data.metrics.revenue.value),
      metric: data.metrics.revenue,
      icon: CircleDollarSign,
      iconClassName: 'bg-emerald-50 text-emerald-700',
    },
    {
      title: 'Pending Approvals',
      value: formatCompactNumber(data.metrics.pendingApprovals.value),
      metric: data.metrics.pendingApprovals,
      icon: Clock3,
      iconClassName: 'bg-amber-50 text-amber-700',
    },
  ] as const;

  return (
    <section className="min-h-[calc(100vh-var(--header-height))] bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.12),transparent_30%),linear-gradient(180deg,#f8fbff_0%,#ffffff_45%)]">
      <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <motion.div
          initial={shouldReduceMotion ? undefined : { opacity: 0, y: 14 }}
          animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between"
        >
          <div className="space-y-2">
            <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
              Overview
            </Badge>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Welcome back. Here&apos;s what&apos;s happening across Boardly.
              </h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-600 sm:text-base">
                A live operational view of billboard inventory, reservations, revenue, and review
                queues for {data.periodLabel}.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative min-w-0 sm:w-80">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={searchValue}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  startTransition(() => {
                    setSearchValue(nextValue);
                  });
                }}
                placeholder="Search locations, campaigns, companies..."
                className="h-10 rounded-xl border-white/80 bg-white/80 pr-3 pl-9 shadow-sm shadow-slate-200/50"
              />
            </div>

            <Select value={period} onValueChange={(value) => setPeriod(value ?? 'this-month')}>
              <SelectTrigger className="h-10 min-w-36 rounded-xl border-white/80 bg-white/80 shadow-sm shadow-slate-200/50">
                <SelectValue placeholder="This month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this-month">This month</SelectItem>
              </SelectContent>
            </Select>

            <Link
              href="/user/admin/bookings"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Review queue
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card, index) => {
            const Icon = card.icon;

            return (
              <motion.div
                key={card.title}
                initial={shouldReduceMotion ? undefined : { opacity: 0, y: 18 }}
                animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut', delay: index * 0.05 }}
              >
                <Card className={cn(CARD_SHELL, 'rounded-[28px] border-white/70')}>
                  <CardHeader className="space-y-4">
                    <div
                      className={cn(
                        'flex size-12 items-center justify-center rounded-2xl border border-white/70',
                        card.iconClassName,
                      )}
                    >
                      <Icon className="size-5" />
                    </div>
                    <div className="space-y-1">
                      <CardDescription className="text-sm text-slate-500">
                        {card.title}
                      </CardDescription>
                      <CardTitle className="text-3xl font-semibold tracking-tight text-slate-950">
                        {card.value}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <MetricDelta metric={card.metric} />
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <motion.div
            initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut', delay: 0.1 }}
          >
            <Card className={cn(CARD_SHELL, 'rounded-[30px] border-white/70')}>
              <CardHeader>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl text-slate-950">Revenue overview</CardTitle>
                    <CardDescription>
                      {formatCurrency(data.metrics.revenue.value)} recognized across the last seven
                      days.
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="border-blue-100 bg-blue-50/80 text-blue-700">
                    {data.periodLabel}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="h-80 px-2 sm:px-6">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={data.revenueSeries}
                    margin={{ left: 4, right: 12, top: 12, bottom: 4 }}
                  >
                    <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="4 4" />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={12} />
                    <Tooltip
                      cursor={{ stroke: '#bfdbfe', strokeWidth: 1 }}
                      formatter={(value) =>
                        formatCurrency(toNumericValue(value as number | string | undefined))
                      }
                      contentStyle={{
                        borderRadius: '16px',
                        borderColor: '#dbeafe',
                        boxShadow: '0 20px 45px -28px rgba(15, 23, 42, 0.45)',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#2563eb"
                      strokeWidth={3}
                      dot={{ r: 0 }}
                      activeDot={{ r: 5, fill: '#2563eb', stroke: '#dbeafe', strokeWidth: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut', delay: 0.16 }}
          >
            <Card className={cn(CARD_SHELL, 'rounded-[30px] border-white/70')}>
              <CardHeader>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl text-slate-950">Bookings overview</CardTitle>
                    <CardDescription>
                      {formatCompactNumber(
                        data.bookingSeries.reduce((sum, item) => sum + item.bookings, 0),
                      )}{' '}
                      new reservation requests in the last seven days.
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="border-cyan-100 bg-cyan-50/80 text-cyan-700">
                    Rolling 7 days
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="h-80 px-2 sm:px-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.bookingSeries}
                    margin={{ left: 4, right: 12, top: 12, bottom: 4 }}
                  >
                    <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="4 4" />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={12} />
                    <Tooltip
                      formatter={(value) => [
                        `${toNumericValue(value as number | string | undefined)} bookings`,
                        'Requests',
                      ]}
                      contentStyle={{
                        borderRadius: '16px',
                        borderColor: '#cffafe',
                        boxShadow: '0 20px 45px -28px rgba(15, 23, 42, 0.45)',
                      }}
                    />
                    <Bar
                      dataKey="bookings"
                      fill="#3b82f6"
                      radius={[12, 12, 4, 4]}
                      maxBarSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.1fr_0.95fr_1.2fr]">
          <motion.div
            initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut', delay: 0.2 }}
          >
            <Card className={cn(CARD_SHELL, 'h-full rounded-[30px] border-white/70')}>
              <CardHeader>
                <CardTitle className="text-xl text-slate-950">Revenue by city</CardTitle>
                <CardDescription>
                  Where this month&apos;s strongest bookings are landing.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.revenueByCity.length === 0 ? (
                  <EmptyList message="No recognized revenue yet for this month." />
                ) : (
                  data.revenueByCity.map((city) => (
                    <div key={city.city} className="space-y-2">
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <div>
                          <p className="font-medium text-slate-900">{city.city}</p>
                          <p className="text-xs text-slate-500">{city.bookings} bookings</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-slate-900">
                            {formatCurrency(city.revenue)}
                          </p>
                          <p className="text-xs text-slate-500">{city.share.toFixed(1)}%</p>
                        </div>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100">
                        <div
                          className="h-2 rounded-full bg-linear-to-r from-blue-500 to-cyan-400"
                          style={{ width: `${Math.max(city.share, 6)}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut', delay: 0.24 }}
          >
            <Card className={cn(CARD_SHELL, 'h-full rounded-[30px] border-white/70')}>
              <CardHeader>
                <CardTitle className="text-xl text-slate-950">Inventory status</CardTitle>
                <CardDescription>
                  Live distribution across screens and static faces.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.inventoryStatus}
                        dataKey="count"
                        nameKey="status"
                        innerRadius={60}
                        outerRadius={88}
                        strokeWidth={0}
                      >
                        {data.inventoryStatus.map((entry) => (
                          <Cell key={entry.status} fill={INVENTORY_COLORS[entry.status]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, _name, item) => {
                          const status = item.payload.status as InventoryStatusPoint['status'];
                          return [
                            `${toNumericValue(value as number | string | undefined)} billboards`,
                            INVENTORY_LABELS[status],
                          ];
                        }}
                        contentStyle={{
                          borderRadius: '16px',
                          borderColor: '#dbeafe',
                          boxShadow: '0 20px 45px -28px rgba(15, 23, 42, 0.45)',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-3">
                  {data.inventoryStatus.map((status) => (
                    <div
                      key={status.status}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="size-2.5 rounded-full"
                          style={{ backgroundColor: INVENTORY_COLORS[status.status] }}
                        />
                        <span className="text-slate-700">{INVENTORY_LABELS[status.status]}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-900">{status.count}</p>
                        <p className="text-xs text-slate-500">{status.share.toFixed(1)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut', delay: 0.28 }}
          >
            <Card className={cn(CARD_SHELL, 'h-full rounded-[30px] border-white/70')}>
              <CardHeader>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl text-slate-950">
                      Top performing locations
                    </CardTitle>
                    <CardDescription>Highest revenue-producing screens this month.</CardDescription>
                  </div>
                  <Link
                    href="/user/admin/billboards"
                    className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 transition hover:text-blue-700"
                  >
                    View inventory
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {filteredTopLocations.length === 0 ? (
                  <EmptyList message="No location data matches the current filter." />
                ) : (
                  <Table>
                    <TableHeader>
                      {topLocationsTable.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                          {headerGroup.headers.map((header) => (
                            <TableHead key={header.id}>
                              {header.isPlaceholder
                                ? null
                                : flexRender(header.column.columnDef.header, header.getContext())}
                            </TableHead>
                          ))}
                        </TableRow>
                      ))}
                    </TableHeader>
                    <TableBody>
                      {topLocationsTable.getRowModel().rows.map((row) => (
                        <TableRow key={row.id}>
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.9fr]">
          <motion.div
            initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut', delay: 0.32 }}
          >
            <Card
              className={cn(CARD_SHELL, 'relative overflow-hidden rounded-[30px] border-white/70')}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(59,130,246,0.18),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(14,165,233,0.15),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.35),rgba(255,255,255,0))]" />
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-2 text-xl text-slate-950">
                  <MapPinned className="size-5 text-blue-600" />
                  Live inventory pulse
                </CardTitle>
                <CardDescription>
                  City-level availability balance based on current inventory status.
                </CardDescription>
              </CardHeader>
              <CardContent className="relative grid gap-3 lg:grid-cols-2">
                {data.liveInventoryCities.length === 0 ? (
                  <EmptyList message="Inventory needs more city coverage before pulse data can render." />
                ) : (
                  data.liveInventoryCities.map((city, index) => (
                    <motion.div
                      key={city.city}
                      initial={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.96 }}
                      animate={shouldReduceMotion ? undefined : { opacity: 1, scale: 1 }}
                      transition={{ duration: 0.25, delay: 0.34 + index * 0.04 }}
                      className="rounded-[24px] border border-white/80 bg-white/80 p-4 shadow-sm shadow-slate-200/50"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-medium text-slate-950">{city.city}</p>
                          <p className="text-xs text-slate-500">{city.total} total units</p>
                        </div>
                        <Badge
                          variant="outline"
                          className="border-blue-100 bg-blue-50 text-blue-700"
                        >
                          {city.live} live
                        </Badge>
                      </div>
                      <div className="mt-4 space-y-2 text-xs text-slate-600">
                        <div>
                          <div className="mb-1 flex items-center justify-between">
                            <span>Live</span>
                            <span>{city.live}</span>
                          </div>
                          <div className="h-2 rounded-full bg-slate-100">
                            <div
                              className="h-2 rounded-full bg-blue-500"
                              style={{
                                width: `${city.total === 0 ? 0 : (city.live / city.total) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="mb-1 flex items-center justify-between">
                            <span>Booked</span>
                            <span>{city.booked}</span>
                          </div>
                          <div className="h-2 rounded-full bg-slate-100">
                            <div
                              className="h-2 rounded-full bg-cyan-400"
                              style={{
                                width: `${city.total === 0 ? 0 : (city.booked / city.total) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="mb-1 flex items-center justify-between">
                            <span>Maintenance</span>
                            <span>{city.maintenance}</span>
                          </div>
                          <div className="h-2 rounded-full bg-slate-100">
                            <div
                              className="h-2 rounded-full bg-amber-400"
                              style={{
                                width: `${city.total === 0 ? 0 : (city.maintenance / city.total) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut', delay: 0.36 }}
          >
            <Card className={cn(CARD_SHELL, 'h-full rounded-[30px] border-white/70')}>
              <CardHeader>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl text-slate-950">Pending approvals</CardTitle>
                    <CardDescription>
                      High-priority reservation requests waiting on review.
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="border-amber-100 bg-amber-50 text-amber-700">
                    {data.metrics.pendingApprovals.value} open
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {filteredPendingApprovals.length === 0 ? (
                  <EmptyList message="No pending approvals match the current filter." />
                ) : (
                  filteredPendingApprovals.map((item) => (
                    <PendingApprovalCard key={item.id} item={item} />
                  ))
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <motion.div
            initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut', delay: 0.4 }}
          >
            <Card className={cn(CARD_SHELL, 'rounded-[30px] border-white/70')}>
              <CardHeader>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl text-slate-950">Recent reservations</CardTitle>
                    <CardDescription>
                      The latest reservation activity reaching the platform.
                    </CardDescription>
                  </div>
                  <Link
                    href="/user/admin/bookings"
                    className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 transition hover:text-blue-700"
                  >
                    View all
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {filteredReservations.length === 0 ? (
                  <EmptyList message="No recent reservations match the current filter." />
                ) : (
                  filteredReservations.map((item) => <ReservationRow key={item.id} item={item} />)
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut', delay: 0.44 }}
          >
            <Card className={cn(CARD_SHELL, 'rounded-[30px] border-white/70')}>
              <CardHeader>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl text-slate-950">Recent activity</CardTitle>
                    <CardDescription>
                      Operational changes most likely to need admin follow-up.
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-700">
                    Live feed
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {filteredActivity.length === 0 ? (
                  <EmptyList message="No recent activity matches the current filter." />
                ) : (
                  filteredActivity.map((item) => <ActivityRow key={item.id} item={item} />)
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
          animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut', delay: 0.48 }}
        >
          <Card className={cn(CARD_SHELL, 'rounded-[30px] border-white/70')}>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl text-slate-950">
                    <Sparkles className="size-5 text-blue-600" />
                    Quick access
                  </CardTitle>
                  <CardDescription>
                    Jump straight into the tools that unblock operations fastest.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
                {QUICK_ACCESS.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="group rounded-[24px] border border-slate-200/80 bg-white/85 p-4 shadow-sm shadow-slate-200/40 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-100/60"
                    >
                      <div className="flex size-11 items-center justify-center rounded-2xl bg-slate-950 text-white transition group-hover:bg-blue-600">
                        <Icon className="size-5" />
                      </div>
                      <div className="mt-4 space-y-1">
                        <p className="font-medium text-slate-950">{item.label}</p>
                        <p className="text-sm text-slate-600">{item.description}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
