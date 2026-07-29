'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { Billboard } from '@/shared/types/billboard';
import { billboardClientService } from '@/client/features/billboards/services/billboard-client.service';
import { useDebouncedValue } from '@/client/features/billboards/hooks/use-debounced-value';
import {
  EMPTY_BILLBOARD_FILTERS,
  type BillboardFilters,
} from '@/client/features/billboards/types/billboard-filters';
import type { BillboardQuerySchemaInput } from '@/shared/contracts/billboard/billboard-query.schema';

type LoadStatus = 'loading' | 'ready' | 'error';

function filtersFromSearchParams(searchParams: URLSearchParams): BillboardFilters {
  return {
    q: searchParams.get('q') ?? '',
    type: (searchParams.get('type') as BillboardFilters['type']) ?? '',
    city: searchParams.get('city') ?? '',
    status: (searchParams.get('status') as BillboardFilters['status']) ?? '',
    minPrice: searchParams.get('minPrice') ?? '',
    maxPrice: searchParams.get('maxPrice') ?? '',
  };
}

function toQueryPayload(filters: BillboardFilters): BillboardQuerySchemaInput {
  return {
    q: filters.q.trim() || undefined,
    type: filters.type || undefined,
    city: filters.city.trim() || undefined,
    status: filters.status || undefined,
    minPrice: filters.minPrice || undefined,
    maxPrice: filters.maxPrice || undefined,
  };
}

export function useBillboardSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<BillboardFilters>(() =>
    filtersFromSearchParams(searchParams),
  );
  const [billboards, setBillboards] = useState<Billboard[]>([]);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [error, setError] = useState<string | null>(null);

  // Only the free-text search is debounced (BB-6); dropdowns/price filter apply immediately.
  const debouncedQuery = useDebouncedValue(filters.q, 350);

  const effectiveFilters = useMemo(
    () => ({ ...filters, q: debouncedQuery }),
    [filters, debouncedQuery],
  );

  // Reset to 'loading' during render as soon as effectiveFilters changes,
  // instead of synchronously inside the fetch effect. This is the pattern
  // React docs recommend for "adjusting state when a value changes" and
  // avoids the extra cascading render that react-hooks/set-state-in-effect
  // flags — setState during render is applied before the browser paints,
  // so there's no visible difference, just one fewer render pass.
  const [trackedFilters, setTrackedFilters] = useState(effectiveFilters);
  if (trackedFilters !== effectiveFilters) {
    setTrackedFilters(effectiveFilters);
    setStatus('loading');
  }

  // Reflect filters in the URL so searches are shareable (BB-7 technical note).
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(toQueryPayload(effectiveFilters)).forEach(([key, value]) => {
      if (value) params.set(key, String(value));
    });
    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  }, [effectiveFilters, pathname, router]);

  useEffect(() => {
    let active = true;

    billboardClientService
      .list(toQueryPayload(effectiveFilters))
      .then((result) => {
        if (!active) return;
        if (!result.ok) {
          setError(result.error ?? 'We could not load billboard inventory. Try again.');
          setStatus('error');
          return;
        }
        setBillboards((result.data?.billboards as Billboard[] | undefined) ?? []);
        setError(null);
        setStatus('ready');
      })
      .catch((err) => {
        if (!active) return;
        setError(
          err instanceof Error ? err.message : 'We could not load billboard inventory. Try again.',
        );
        setStatus('error');
      });

    return () => {
      active = false;
    };
  }, [effectiveFilters]);

  const updateFilter = useCallback(
    <K extends keyof BillboardFilters>(key: K, value: BillboardFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const clearFilters = useCallback(() => {
    setFilters(EMPTY_BILLBOARD_FILTERS);
  }, []);

  const hasActiveFilters = Object.values(filters).some((value) => value !== '');

  return { filters, updateFilter, clearFilters, hasActiveFilters, billboards, status, error };
}
