'use client';

import { useBillboardSearch } from '@/client/features/billboards/hooks/use-billboard-search';
import { BillboardSearchFilters } from '@/client/features/billboards/components/billboard-search-filters';
import { BillboardResultsGrid } from '@/client/features/billboards/components/billboard-results-grid';

export function AdvertiserBillboardsPage() {
  const { filters, updateFilter, clearFilters, hasActiveFilters, billboards, status, error } =
    useBillboardSearch();

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Advertiser Marketplace</h1>
        <p className="text-sm text-zinc-600">
          Search and filter billboard locations that match your campaign needs.
        </p>
      </header>

      <BillboardSearchFilters
        filters={filters}
        onChange={updateFilter}
        onClear={clearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      <BillboardResultsGrid
        billboards={billboards}
        isLoading={status === 'loading'}
        error={status === 'error' ? error : null}
        emptyMessage={
          hasActiveFilters
            ? 'No billboards match your search or filters.'
            : 'No billboards are available right now.'
        }
      />
    </section>
  );
}
