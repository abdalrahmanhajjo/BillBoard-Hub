'use client';

import { useState } from 'react';
import { AlertCircle, Building2, CircleDollarSign, Loader2, RefreshCw, Users } from 'lucide-react';
import { Button } from '@/client/ui/components/ui/button';
import {
  EmptyState,
  StatCard,
  WorkspacePage,
} from '@/client/features/dashboard/components/workspace-page';
import { ListToolbar } from '@/client/features/dashboard/components/list-toolbar';
import { buildCsv, downloadCsv } from '@/client/features/dashboard/utils/csv-export';
import { formatCurrency, formatDate } from '@/client/features/dashboard/utils/advertiser-metrics';
import { useAdvertiserDirectory } from '@/client/features/users/hooks/use-advertiser-directory';
import type { AdvertiserDirectoryEntry, CurrencyTotal } from '@/shared/types/advertiser-directory';

type StatusFilter = 'all' | 'active' | 'inactive' | 'engaged' | 'dormant';
type SortKey = 'spend-desc' | 'recent-desc' | 'joined-desc' | 'name-asc';

const STATUS_OPTIONS: Array<{ value: StatusFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active accounts' },
  { value: 'inactive', label: 'Deactivated' },
  { value: 'engaged', label: 'Has reservations' },
  { value: 'dormant', label: 'No reservations' },
];

const SORT_OPTIONS: Array<{ value: SortKey; label: string }> = [
  { value: 'spend-desc', label: 'Highest spend' },
  { value: 'recent-desc', label: 'Most recent activity' },
  { value: 'joined-desc', label: 'Newest accounts' },
  { value: 'name-asc', label: 'Name A–Z' },
];

/** Currencies are not comparable, so ranking uses the largest single total. */
function largestTotal(totals: CurrencyTotal[]): number {
  return totals.reduce((largest, total) => Math.max(largest, total.amount), 0);
}

function formatCurrencyTotals(totals: CurrencyTotal[]): string {
  if (totals.length === 0) return '—';
  return totals.map((total) => formatCurrency(total.amount, total.currency)).join(' · ');
}

function fullName(entry: AdvertiserDirectoryEntry): string {
  return `${entry.firstName} ${entry.lastName}`.trim();
}

function matchesStatus(entry: AdvertiserDirectoryEntry, filter: StatusFilter): boolean {
  switch (filter) {
    case 'active':
      return entry.isActive;
    case 'inactive':
      return !entry.isActive;
    case 'engaged':
      return entry.bookings.total > 0;
    case 'dormant':
      return entry.bookings.total === 0;
    default:
      return true;
  }
}

const SORTERS: Record<
  SortKey,
  (a: AdvertiserDirectoryEntry, b: AdvertiserDirectoryEntry) => number
> = {
  'spend-desc': (a, b) => largestTotal(b.spend) - largestTotal(a.spend),
  'recent-desc': (a, b) => (b.lastActivityAt ?? '').localeCompare(a.lastActivityAt ?? ''),
  'joined-desc': (a, b) => (b.joinedAt ?? '').localeCompare(a.joinedAt ?? ''),
  'name-asc': (a, b) => fullName(a).localeCompare(fullName(b)),
};

export function AdminAdvertisersFeaturePage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useAdvertiserDirectory();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('spend-desc');

  const allAdvertisers = data?.advertisers ?? [];
  const summary = data?.summary;

  // Left unmemoized on purpose: React Compiler handles this, and a manual
  // useMemo here is one it cannot preserve.
  const searchTerm = search.trim().toLowerCase();
  const advertisers = allAdvertisers
    .filter((entry) => {
      if (!matchesStatus(entry, statusFilter)) return false;
      if (!searchTerm) return true;
      return [
        fullName(entry),
        entry.email,
        entry.companyName ?? '',
        entry.address ?? '',
        entry.country ?? '',
      ]
        .join(' ')
        .toLowerCase()
        .includes(searchTerm);
    })
    .sort(SORTERS[sortKey]);

  const handleExport = () => {
    const csv = buildCsv(advertisers, [
      { header: 'Name', value: (entry) => fullName(entry) },
      { header: 'Email', value: (entry) => entry.email },
      { header: 'Company', value: (entry) => entry.companyName ?? '' },
      { header: 'Address', value: (entry) => entry.address ?? '' },
      { header: 'Country', value: (entry) => entry.country ?? '' },
      { header: 'Phone', value: (entry) => entry.phone ?? '' },
      { header: 'Account status', value: (entry) => (entry.isActive ? 'active' : 'deactivated') },
      { header: 'Joined', value: (entry) => entry.joinedAt ?? '' },
      { header: 'Campaigns', value: (entry) => entry.campaigns.total },
      { header: 'Active campaigns', value: (entry) => entry.campaigns.active },
      { header: 'Reservations', value: (entry) => entry.bookings.total },
      { header: 'Pending reservations', value: (entry) => entry.bookings.pending },
      { header: 'Running reservations', value: (entry) => entry.bookings.active },
      { header: 'Recognized spend', value: (entry) => formatCurrencyTotals(entry.spend) },
      { header: 'Outstanding', value: (entry) => formatCurrencyTotals(entry.outstanding) },
      { header: 'Last activity', value: (entry) => entry.lastActivityAt ?? '' },
    ]);

    downloadCsv(`boardly-advertisers-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };

  return (
    <WorkspacePage
      title="Advertisers"
      description="Every advertiser account on the platform, with the campaigns, reservations, and revenue attached to it."
      actions={
        <Button variant="outline" onClick={() => void refetch()} disabled={isFetching}>
          <RefreshCw className={isFetching ? 'size-4 animate-spin' : 'size-4'} aria-hidden />
          Refresh
        </Button>
      }
    >
      {isError ? (
        <div
          role="alert"
          className="border-destructive/30 bg-destructive/8 text-destructive mb-6 flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>{error instanceof Error ? error.message : 'Unknown directory error.'}</span>
        </div>
      ) : null}

      {isLoading ? (
        <div className="text-muted-foreground flex items-center gap-2 py-16 text-sm">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Loading advertisers...
        </div>
      ) : allAdvertisers.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No advertisers yet"
          description="Advertiser accounts appear here as soon as someone registers on the platform."
        />
      ) : (
        <div className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={Building2}
              label="Advertisers"
              value={String(summary?.total ?? 0)}
              hint={`${summary?.active ?? 0} active`}
            />
            <StatCard
              icon={Users}
              label="Deactivated"
              value={String(summary?.inactive ?? 0)}
              hint="Cannot sign in"
            />
            <StatCard
              icon={Users}
              label="With reservations"
              value={String(summary?.engaged ?? 0)}
              hint={`${(summary?.total ?? 0) - (summary?.engaged ?? 0)} never booked`}
            />
            <StatCard
              icon={CircleDollarSign}
              label="Recognized revenue"
              value={formatCurrencyTotals(summary?.spend ?? [])}
              hint="Approved and completed reservations"
            />
          </div>

          <div>
            <ListToolbar
              searchValue={search}
              onSearchChange={setSearch}
              searchPlaceholder="Search name, email, company, or country"
              summary={`${advertisers.length} of ${allAdvertisers.length}`}
              onExport={advertisers.length > 0 ? handleExport : undefined}
              filters={[
                {
                  id: 'advertiser-status-filter',
                  label: 'Status',
                  value: statusFilter,
                  onChange: (value) => setStatusFilter(value as StatusFilter),
                  options: STATUS_OPTIONS,
                },
                {
                  id: 'advertiser-sort',
                  label: 'Sort by',
                  value: sortKey,
                  onChange: (value) => setSortKey(value as SortKey),
                  options: SORT_OPTIONS,
                },
              ]}
            />

            {advertisers.length === 0 ? (
              <EmptyState
                icon={Building2}
                title="No advertisers match those filters"
                description="Try a different search term or account status."
              />
            ) : (
              <div className="bg-card overflow-hidden rounded-xl border">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-4xl text-sm">
                    <thead className="bg-muted/50 text-muted-foreground text-left text-xs uppercase">
                      <tr>
                        <th className="px-4 py-3 font-medium">Advertiser</th>
                        <th className="px-4 py-3 font-medium">Company</th>
                        <th className="px-4 py-3 text-right font-medium">Campaigns</th>
                        <th className="px-4 py-3 text-right font-medium">Reservations</th>
                        <th className="px-4 py-3 text-right font-medium">Spend</th>
                        <th className="px-4 py-3 text-right font-medium">Outstanding</th>
                        <th className="px-4 py-3 font-medium">Last activity</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {advertisers.map((entry) => (
                        <AdvertiserRow key={entry.id} entry={entry} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <p className="text-muted-foreground text-xs">
            Company details come from each advertiser&apos;s profile, falling back to their most
            recent reservation for accounts registered before profiles existed. Spend counts
            approved and completed reservations only, grouped by invoice currency.
          </p>
        </div>
      )}
    </WorkspacePage>
  );
}

function AdvertiserRow({ entry }: { entry: AdvertiserDirectoryEntry }) {
  return (
    <tr>
      <td className="px-4 py-3">
        <span className="font-medium">{fullName(entry)}</span>
        <span className="text-muted-foreground block text-xs">{entry.email}</span>
      </td>
      <td className="px-4 py-3">
        {entry.companyName ? (
          <>
            <span>{entry.companyName}</span>
            {(entry.address ?? entry.country) ? (
              <span className="text-muted-foreground block text-xs">
                {entry.address ?? entry.country}
              </span>
            ) : null}
          </>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </td>
      <td className="px-4 py-3 text-right whitespace-nowrap">
        <span className="font-medium">{entry.campaigns.total}</span>
        <span className="text-muted-foreground block text-xs">{entry.campaigns.active} active</span>
      </td>
      <td className="px-4 py-3 text-right whitespace-nowrap">
        <span className="font-medium">{entry.bookings.total}</span>
        <span className="text-muted-foreground block text-xs">
          {entry.bookings.active} running · {entry.bookings.pending} pending
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
      <td className="text-muted-foreground px-4 py-3 text-xs whitespace-nowrap">
        {entry.lastActivityAt ? formatDate(entry.lastActivityAt) : 'No activity'}
        <span className="block">Joined {formatDate(entry.joinedAt ?? undefined)}</span>
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap ${
            entry.isActive
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-zinc-200 bg-zinc-100 text-zinc-600'
          }`}
        >
          {entry.isActive ? 'Active' : 'Deactivated'}
        </span>
      </td>
    </tr>
  );
}
