'use client';

import { MapPinned, MonitorPlay, RadioTower } from 'lucide-react';
import { useBillboardSearch } from '@/client/features/billboards/hooks/use-billboard-search';
import { BillboardSearchFilters } from '@/client/features/billboards/components/billboard-search-filters';
import { BillboardResultsGrid } from '@/client/features/billboards/components/billboard-results-grid';
import {
  SectionCard,
  StatCard,
  WorkspacePage,
} from '@/client/features/dashboard/components/workspace-page';
import { BILLBOARD_STATUSES, BILLBOARD_TYPES } from '@/shared/constants/billboard';

export function AdvertiserBillboardsPage() {
  const { filters, updateFilter, clearFilters, hasActiveFilters, billboards, status, error } =
    useBillboardSearch();

  const available = billboards.filter(
    (billboard) => billboard.status === BILLBOARD_STATUSES.AVAILABLE,
  ).length;
  const digital = billboards.filter(
    (billboard) => billboard.type === BILLBOARD_TYPES.DIGITAL,
  ).length;
  const cities = new Set(billboards.map((billboard) => billboard.location.city)).size;

  return (
    <WorkspacePage
      eyebrow="Marketplace"
      title="Find your next placement"
      description="Search and filter verified billboard locations that match your campaign needs, then reserve the dates you want."
      canvas
    >
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          index={0}
          icon={RadioTower}
          accent="bg-emerald-50 text-emerald-700"
          label="Available now"
          value={String(available)}
          hint={`${billboards.length} in results`}
        />
        <StatCard
          index={1}
          icon={MonitorPlay}
          accent="bg-blue-50 text-blue-700"
          label="Digital screens"
          value={String(digital)}
          hint="Rotating placements"
        />
        <StatCard
          index={2}
          icon={MapPinned}
          accent="bg-cyan-50 text-cyan-700"
          label="Cities covered"
          value={String(cities)}
          hint="Across Lebanon"
        />
      </div>

      <div className="space-y-4">
        <SectionCard
          title="Filters"
          description="Narrow the inventory by location, format, availability, and budget."
        >
          <BillboardSearchFilters
            filters={filters}
            onChange={updateFilter}
            onClear={clearFilters}
            hasActiveFilters={hasActiveFilters}
          />
        </SectionCard>

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
      </div>
    </WorkspacePage>
  );
}
