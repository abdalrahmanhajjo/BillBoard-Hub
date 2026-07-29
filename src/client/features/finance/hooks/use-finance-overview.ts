'use client';

import { useQuery } from '@tanstack/react-query';
import { financeClientService } from '@/client/features/finance/services/finance-client.service';
import type { FinanceOverview } from '@/shared/types/finance';

async function fetchOverview(): Promise<FinanceOverview> {
  const result = await financeClientService.getOverview();
  if (!result.ok || !result.data) {
    throw new Error(result.error ?? 'We could not build the financial overview.');
  }
  return result.data.overview;
}

/**
 * One shared query for every finance screen, so the dashboard and the reports
 * page always quote the same window — two independent fetches could straddle a
 * month boundary and disagree about the month's profit.
 */
export function useFinanceOverview() {
  const query = useQuery({
    queryKey: ['finance', 'overview'],
    queryFn: fetchOverview,
    staleTime: 30_000,
  });

  return {
    overview: query.data ?? null,
    status: query.isPending
      ? ('loading' as const)
      : query.isError
        ? ('error' as const)
        : ('ready' as const),
    error: query.error instanceof Error ? query.error.message : null,
    reload: () => void query.refetch(),
  };
}
