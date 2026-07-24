'use client';

import { BILLBOARD_STATUSES, BILLBOARD_TYPES } from '@/shared/constants/billboard';
import type { BillboardFilters } from '@/client/features/billboards/types/billboard-filters';

type BillboardSearchFiltersProps = {
  filters: BillboardFilters;
  onChange: <K extends keyof BillboardFilters>(key: K, value: BillboardFilters[K]) => void;
  onClear: () => void;
  hasActiveFilters: boolean;
};

export function BillboardSearchFilters({
  filters,
  onChange,
  onClear,
  hasActiveFilters,
}: BillboardSearchFiltersProps) {
  return (
    <div className="space-y-4 rounded-lg border border-zinc-200 p-4">
      <input
        type="search"
        value={filters.q}
        onChange={(event) => onChange('q', event.target.value)}
        placeholder="Search by city, address, or name…"
        aria-label="Search billboards by location"
        className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-600">Type</span>
          <select
            value={filters.type}
            onChange={(event) => onChange('type', event.target.value as BillboardFilters['type'])}
            className="rounded-md border border-zinc-300 px-2 py-1.5 text-sm"
          >
            <option value="">All types</option>
            {Object.values(BILLBOARD_TYPES).map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-600">City</span>
          <input
            type="text"
            value={filters.city}
            onChange={(event) => onChange('city', event.target.value)}
            placeholder="Any city"
            className="rounded-md border border-zinc-300 px-2 py-1.5 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-600">Availability</span>
          <select
            value={filters.status}
            onChange={(event) =>
              onChange('status', event.target.value as BillboardFilters['status'])
            }
            className="rounded-md border border-zinc-300 px-2 py-1.5 text-sm"
          >
            <option value="">Any status</option>
            {Object.values(BILLBOARD_STATUSES).map((statusValue) => (
              <option key={statusValue} value={statusValue}>
                {statusValue}
              </option>
            ))}
          </select>
        </label>

        <div className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-600">Budget (monthly)</span>
          <div className="flex gap-2">
            <input
              type="number"
              min={0}
              inputMode="decimal"
              value={filters.minPrice}
              onChange={(event) => onChange('minPrice', event.target.value)}
              placeholder="Min"
              aria-label="Minimum monthly price"
              className="w-1/2 rounded-md border border-zinc-300 px-2 py-1.5 text-sm"
            />
            <input
              type="number"
              min={0}
              inputMode="decimal"
              value={filters.maxPrice}
              onChange={(event) => onChange('maxPrice', event.target.value)}
              placeholder="Max"
              aria-label="Maximum monthly price"
              className="w-1/2 rounded-md border border-zinc-300 px-2 py-1.5 text-sm"
            />
          </div>
        </div>
      </div>

      {hasActiveFilters ? (
        <button
          type="button"
          onClick={onClear}
          className="text-sm font-medium text-zinc-700 underline underline-offset-2 hover:text-zinc-900"
        >
          Clear filters
        </button>
      ) : null}
    </div>
  );
}
