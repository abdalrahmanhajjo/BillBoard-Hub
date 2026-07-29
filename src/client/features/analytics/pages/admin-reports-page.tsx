'use client';

import {
  AlertCircle,
  Building2,
  CalendarCheck,
  CircleDollarSign,
  Download,
  Gauge,
  Loader2,
  MapPinned,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/client/ui/components/ui/button';
import {
  EmptyState,
  StatCard,
  WorkspacePage,
} from '@/client/features/dashboard/components/workspace-page';
import { buildCsv, downloadCsv } from '@/client/features/dashboard/utils/csv-export';
import { formatCurrency } from '@/client/features/dashboard/utils/advertiser-metrics';
import { useAdminDashboardOverview } from '@/client/features/dashboard/hooks/use-admin-dashboard-overview';
import { useAdvertiserDirectory } from '@/client/features/users/hooks/use-advertiser-directory';
import { BILLBOARD_STATUSES } from '@/shared/constants/billboard';
import type { AdminDashboardOverview, InventoryStatusPoint } from '@/shared/types/dashboard';
import type { AdvertiserDirectoryEntry, CurrencyTotal } from '@/shared/types/advertiser-directory';

const INVENTORY_LABELS: Record<InventoryStatusPoint['status'], string> = {
  available: 'Available',
  reserved: 'Reserved',
  occupied: 'Occupied',
  maintenance: 'Maintenance',
};

const INVENTORY_BARS: Record<InventoryStatusPoint['status'], string> = {
  available: 'bg-blue-500',
  reserved: 'bg-sky-400',
  occupied: 'bg-emerald-500',
  maintenance: 'bg-amber-400',
};

/** Inventory earning or committed to earn, as a share of everything on the platform. */
function occupancyRate(inventory: InventoryStatusPoint[]): number {
  const total = inventory.reduce((sum, point) => sum + point.count, 0);
  if (total === 0) return 0;

  const working = inventory
    .filter(
      (point) =>
        point.status === BILLBOARD_STATUSES.OCCUPIED ||
        point.status === BILLBOARD_STATUSES.RESERVED,
    )
    .reduce((sum, point) => sum + point.count, 0);

  return (working / total) * 100;
}

function formatCurrencyTotals(totals: CurrencyTotal[]): string {
  if (totals.length === 0) return '—';
  return totals.map((total) => formatCurrency(total.amount, total.currency)).join(' · ');
}

/** Currencies are not comparable, so ranking uses the largest single total. */
function largestTotal(totals: CurrencyTotal[]): number {
  return totals.reduce((largest, total) => Math.max(largest, total.amount), 0);
}

export function AdminReportsFeaturePage() {
  const overviewQuery = useAdminDashboardOverview();
  const directoryQuery = useAdvertiserDirectory();

  const data = overviewQuery.data;
  const isRefreshing = overviewQuery.isFetching || directoryQuery.isFetching;

  const reload = () => {
    void overviewQuery.refetch();
    void directoryQuery.refetch();
  };

  // The directory is supplementary: the report still stands without it, so its
  // failure is reported inline on that section rather than replacing the page.
  const advertisers = [...(directoryQuery.data?.advertisers ?? [])]
    .filter((entry) => entry.spend.length > 0 || entry.bookings.total > 0)
    .sort((a, b) => largestTotal(b.spend) - largestTotal(a.spend));

  return (
    <WorkspacePage
      title="Reports"
      description="Occupancy, revenue, booking volume, and advertiser trends across the whole platform."
      actions={
        <Button variant="outline" onClick={reload} disabled={isRefreshing}>
          <RefreshCw className={isRefreshing ? 'size-4 animate-spin' : 'size-4'} aria-hidden />
          Refresh
        </Button>
      }
    >
      {overviewQuery.isError ? (
        <div
          role="alert"
          className="border-destructive/30 bg-destructive/8 text-destructive mb-6 flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>
            {overviewQuery.error instanceof Error
              ? overviewQuery.error.message
              : 'The report data could not be loaded.'}
          </span>
        </div>
      ) : null}

      {overviewQuery.isLoading ? (
        <div className="text-muted-foreground flex items-center gap-2 py-16 text-sm">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Building reports...
        </div>
      ) : !data ? (
        <EmptyState
          icon={Gauge}
          title="No report data"
          description="Reports appear once the platform has billboards and reservations to measure."
        />
      ) : (
        <div className="space-y-8">
          <Headline data={data} advertisers={advertisers} />

          <RevenueByCity data={data} />

          <TopLocations data={data} />

          <Occupancy data={data} />

          <AdvertiserLeaderboard
            advertisers={advertisers}
            isLoading={directoryQuery.isLoading}
            error={directoryQuery.error instanceof Error ? directoryQuery.error.message : null}
          />

          <p className="text-muted-foreground text-xs">
            Revenue counts approved and completed reservations for {data.periodLabel}. Platform
            totals are reported in {data.metrics.revenue.currency}; the advertiser table groups by
            each reservation&apos;s own invoice currency, so the two can differ where an advertiser
            was invoiced in something else.
          </p>
        </div>
      )}
    </WorkspacePage>
  );
}

function Headline({
  data,
  advertisers,
}: {
  data: AdminDashboardOverview;
  advertisers: AdvertiserDirectoryEntry[];
}) {
  const currency = data.metrics.revenue.currency;
  const bookingVolume = data.bookingSeries.reduce((sum, point) => sum + point.bookings, 0);

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        icon={CircleDollarSign}
        label="Recognized revenue"
        value={formatCurrency(data.metrics.revenue.value, currency)}
        hint={data.periodLabel}
      />
      <StatCard
        icon={CalendarCheck}
        label="Booking volume"
        value={String(bookingVolume)}
        hint="Requests in the last 7 days"
      />
      <StatCard
        icon={Gauge}
        label="Occupancy"
        value={`${occupancyRate(data.inventoryStatus).toFixed(1)}%`}
        hint="Reserved or occupied inventory"
      />
      <StatCard
        icon={Building2}
        label="Active advertisers"
        value={String(advertisers.length)}
        hint="With at least one reservation"
      />
    </div>
  );
}

function RevenueByCity({ data }: { data: AdminDashboardOverview }) {
  const currency = data.metrics.revenue.currency;

  const handleExport = () => {
    const csv = buildCsv(data.revenueByCity, [
      { header: 'City', value: (row) => row.city },
      { header: 'Revenue', value: (row) => row.revenue },
      { header: 'Currency', value: () => currency },
      { header: 'Bookings', value: (row) => row.bookings },
      { header: 'Share %', value: (row) => row.share.toFixed(1) },
    ]);

    downloadCsv(`boardly-revenue-by-city-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };

  return (
    <ReportSection
      icon={MapPinned}
      title="Revenue by city"
      description="Where recognized revenue is landing this period."
      onExport={data.revenueByCity.length > 0 ? handleExport : undefined}
    >
      {data.revenueByCity.length === 0 ? (
        <ReportEmpty message="No recognized revenue yet for this period." />
      ) : (
        <div className="space-y-4">
          {data.revenueByCity.map((city) => (
            <div key={city.city} className="space-y-2">
              <div className="flex items-center justify-between gap-3 text-sm">
                <div>
                  <p className="font-medium">{city.city}</p>
                  <p className="text-muted-foreground text-xs">{city.bookings} bookings</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(city.revenue, currency)}</p>
                  <p className="text-muted-foreground text-xs">{city.share.toFixed(1)}%</p>
                </div>
              </div>
              <div className="bg-muted h-2 rounded-full">
                <div
                  className="h-2 rounded-full bg-blue-500"
                  style={{ width: `${Math.max(city.share, 2)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </ReportSection>
  );
}

function TopLocations({ data }: { data: AdminDashboardOverview }) {
  const currency = data.metrics.revenue.currency;

  const handleExport = () => {
    const csv = buildCsv(data.topLocations, [
      { header: 'Billboard', value: (row) => row.name },
      { header: 'City', value: (row) => row.city },
      { header: 'Reservations', value: (row) => row.reservations },
      { header: 'Revenue', value: (row) => row.revenue },
      { header: 'Currency', value: () => currency },
      {
        header: 'Average per reservation',
        value: (row) => (row.reservations === 0 ? 0 : Math.round(row.revenue / row.reservations)),
      },
    ]);

    downloadCsv(`boardly-top-locations-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };

  return (
    <ReportSection
      icon={MapPinned}
      title="Top performing locations"
      description="Highest revenue-producing inventory this period."
      onExport={data.topLocations.length > 0 ? handleExport : undefined}
    >
      {data.topLocations.length === 0 ? (
        <ReportEmpty message="No location has produced revenue yet." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-2xl text-sm">
            <thead className="bg-muted/50 text-muted-foreground text-left text-xs uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">Billboard</th>
                <th className="px-4 py-3 text-right font-medium">Reservations</th>
                <th className="px-4 py-3 text-right font-medium">Revenue</th>
                <th className="px-4 py-3 text-right font-medium">Avg per reservation</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.topLocations.map((location) => (
                <tr key={location.billboardId}>
                  <td className="px-4 py-3">
                    <span className="font-medium">{location.name}</span>
                    <span className="text-muted-foreground block text-xs">{location.city}</span>
                  </td>
                  <td className="px-4 py-3 text-right">{location.reservations}</td>
                  <td className="px-4 py-3 text-right font-medium whitespace-nowrap">
                    {formatCurrency(location.revenue, currency)}
                  </td>
                  <td className="text-muted-foreground px-4 py-3 text-right whitespace-nowrap">
                    {location.reservations === 0
                      ? '—'
                      : formatCurrency(location.revenue / location.reservations, currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ReportSection>
  );
}

function Occupancy({ data }: { data: AdminDashboardOverview }) {
  const handleExport = () => {
    const csv = buildCsv(data.liveInventoryCities, [
      { header: 'City', value: (row) => row.city },
      { header: 'Total units', value: (row) => row.total },
      { header: 'Live', value: (row) => row.live },
      { header: 'Booked', value: (row) => row.booked },
      { header: 'Maintenance', value: (row) => row.maintenance },
      { header: 'Offline', value: (row) => row.offline },
    ]);

    downloadCsv(`boardly-occupancy-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };

  return (
    <ReportSection
      icon={Gauge}
      title="Inventory occupancy"
      description="How the estate is distributed right now, platform-wide and by city."
      onExport={data.liveInventoryCities.length > 0 ? handleExport : undefined}
    >
      {data.inventoryStatus.length === 0 ? (
        <ReportEmpty message="No billboards in the inventory yet." />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {data.inventoryStatus.map((point) => (
              <div key={point.status} className="space-y-2">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-medium">{INVENTORY_LABELS[point.status]}</span>
                  <span className="text-sm font-semibold">{point.count}</span>
                </div>
                <div className="bg-muted h-2 rounded-full">
                  <div
                    className={`h-2 rounded-full ${INVENTORY_BARS[point.status]}`}
                    style={{ width: `${Math.max(point.share, 2)}%` }}
                  />
                </div>
                <p className="text-muted-foreground text-xs">{point.share.toFixed(1)}% of estate</p>
              </div>
            ))}
          </div>

          {data.liveInventoryCities.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-2xl text-sm">
                <thead className="bg-muted/50 text-muted-foreground text-left text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 font-medium">City</th>
                    <th className="px-4 py-3 text-right font-medium">Total</th>
                    <th className="px-4 py-3 text-right font-medium">Live</th>
                    <th className="px-4 py-3 text-right font-medium">Booked</th>
                    <th className="px-4 py-3 text-right font-medium">Maintenance</th>
                    <th className="px-4 py-3 text-right font-medium">Utilisation</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.liveInventoryCities.map((city) => (
                    <tr key={city.city}>
                      <td className="px-4 py-3 font-medium">{city.city}</td>
                      <td className="px-4 py-3 text-right">{city.total}</td>
                      <td className="px-4 py-3 text-right">{city.live}</td>
                      <td className="px-4 py-3 text-right">{city.booked}</td>
                      <td className="px-4 py-3 text-right">{city.maintenance}</td>
                      <td className="px-4 py-3 text-right font-medium">
                        {city.total === 0
                          ? '—'
                          : `${((city.booked / city.total) * 100).toFixed(0)}%`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      )}
    </ReportSection>
  );
}

function AdvertiserLeaderboard({
  advertisers,
  isLoading,
  error,
}: {
  advertisers: AdvertiserDirectoryEntry[];
  isLoading: boolean;
  error: string | null;
}) {
  const handleExport = () => {
    const csv = buildCsv(advertisers, [
      {
        header: 'Advertiser',
        value: (entry) => entry.companyName ?? `${entry.firstName} ${entry.lastName}`.trim(),
      },
      { header: 'Email', value: (entry) => entry.email },
      { header: 'Reservations', value: (entry) => entry.bookings.total },
      { header: 'Running', value: (entry) => entry.bookings.active },
      { header: 'Campaigns', value: (entry) => entry.campaigns.total },
      { header: 'Recognized spend', value: (entry) => formatCurrencyTotals(entry.spend) },
      { header: 'Outstanding', value: (entry) => formatCurrencyTotals(entry.outstanding) },
    ]);

    downloadCsv(`boardly-advertiser-trends-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };

  return (
    <ReportSection
      icon={Building2}
      title="Advertiser trends"
      description="Who is spending, what is still running, and what is still owed."
      onExport={advertisers.length > 0 ? handleExport : undefined}
    >
      {error ? (
        <div role="alert" className="text-destructive flex items-start gap-2 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>{error}</span>
        </div>
      ) : isLoading ? (
        <div className="text-muted-foreground flex items-center gap-2 py-6 text-sm">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Loading advertiser trends...
        </div>
      ) : advertisers.length === 0 ? (
        <ReportEmpty message="No advertiser has booked yet." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-2xl text-sm">
            <thead className="bg-muted/50 text-muted-foreground text-left text-xs uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">Advertiser</th>
                <th className="px-4 py-3 text-right font-medium">Campaigns</th>
                <th className="px-4 py-3 text-right font-medium">Reservations</th>
                <th className="px-4 py-3 text-right font-medium">Spend</th>
                <th className="px-4 py-3 text-right font-medium">Outstanding</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {advertisers.map((entry) => (
                <tr key={entry.id}>
                  <td className="px-4 py-3">
                    <span className="font-medium">
                      {entry.companyName ?? `${entry.firstName} ${entry.lastName}`.trim()}
                    </span>
                    <span className="text-muted-foreground block text-xs">{entry.email}</span>
                  </td>
                  <td className="px-4 py-3 text-right">{entry.campaigns.total}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {entry.bookings.total}
                    <span className="text-muted-foreground block text-xs">
                      {entry.bookings.active} running
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium whitespace-nowrap">
                    {formatCurrencyTotals(entry.spend)}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {entry.outstanding.length === 0 ? (
                      <span className="text-muted-foreground">—</span>
                    ) : (
                      <span className="font-medium text-amber-700 dark:text-amber-500">
                        {formatCurrencyTotals(entry.outstanding)}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ReportSection>
  );
}

type ReportSectionProps = {
  icon: typeof Gauge;
  title: string;
  description: string;
  /** Omit to hide the export button, e.g. when the section has no rows. */
  onExport?: () => void;
  children: React.ReactNode;
};

/** One analysis block: a titled card with its own CSV export. */
function ReportSection({ icon: Icon, title, description, onExport, children }: ReportSectionProps) {
  return (
    <section className="bg-card rounded-xl border">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b px-5 py-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="bg-muted text-muted-foreground grid size-9 shrink-0 place-items-center rounded-lg">
            <Icon className="size-4" aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 className="font-medium">{title}</h2>
            <p className="text-muted-foreground mt-0.5 text-sm leading-relaxed">{description}</p>
          </div>
        </div>
        {onExport ? (
          <Button variant="outline" className="h-9 shrink-0 gap-2 text-xs" onClick={onExport}>
            <Download className="size-3.5" aria-hidden />
            Export CSV
          </Button>
        ) : null}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

function ReportEmpty({ message }: { message: string }) {
  return (
    <p className="text-muted-foreground border-border rounded-lg border border-dashed px-4 py-8 text-center text-sm">
      {message}
    </p>
  );
}
