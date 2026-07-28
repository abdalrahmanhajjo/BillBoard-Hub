'use client';

import { Download, Search, X } from 'lucide-react';
import { Button } from '@/client/ui/components/ui/button';
import { Input } from '@/client/ui/components/ui/input';
import { cn } from '@/client/ui/lib/utils';

export type SelectFilter = {
  id: string;
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
};

type ListToolbarProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: SelectFilter[];
  /** Rendered as a download button; omit to hide export entirely. */
  onExport?: () => void;
  exportLabel?: string;
  /** Shown at the end, e.g. "12 of 30". */
  summary?: string;
  className?: string;
};

/**
 * Shared controls for every advertiser list screen, so search, filtering, and
 * export behave and look the same on each one.
 */
export function ListToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters = [],
  onExport,
  exportLabel = 'Export CSV',
  summary,
  className,
}: ListToolbarProps) {
  return (
    <div className={cn('mb-5 flex flex-wrap items-end gap-3', className)}>
      <div className="min-w-56 flex-1">
        <label htmlFor="list-search" className="sr-only">
          Search
        </label>
        <div className="relative">
          <Search
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
            aria-hidden
          />
          <Input
            id="list-search"
            type="search"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
            className="h-10 rounded-lg pr-9 pl-9"
          />
          {searchValue ? (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
              className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 grid size-6 -translate-y-1/2 place-items-center rounded"
            >
              <X className="size-3.5" aria-hidden />
            </button>
          ) : null}
        </div>
      </div>

      {filters.map((filter) => (
        <div key={filter.id} className="min-w-40">
          <label
            htmlFor={filter.id}
            className="text-muted-foreground mb-1 block text-xs font-medium"
          >
            {filter.label}
          </label>
          <select
            id={filter.id}
            value={filter.value}
            onChange={(event) => filter.onChange(event.target.value)}
            className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-10 w-full rounded-lg border px-2.5 text-sm outline-none focus-visible:ring-3"
          >
            {filter.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      ))}

      {onExport ? (
        <Button variant="outline" className="h-10 gap-2" onClick={onExport}>
          <Download className="size-4" aria-hidden />
          {exportLabel}
        </Button>
      ) : null}

      {summary ? (
        <p className="text-muted-foreground ml-auto text-xs" role="status">
          {summary}
        </p>
      ) : null}
    </div>
  );
}
