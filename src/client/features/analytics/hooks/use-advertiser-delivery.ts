'use client';

import { useQuery } from '@tanstack/react-query';
import { impressionClientService } from '@/client/features/impressions/services/impression-client.service';
import type { ImpressionAnalytics } from '@/shared/types/impression';

const EMPTY: ImpressionAnalytics = { total: 0, byCreative: [], recent: [] };

/**
 * Delivery figures for the signed-in advertiser.
 *
 * The endpoint scopes results to the caller server-side, so no advertiser id is
 * sent — asking for someone else's is not expressible from here.
 */
export function useAdvertiserDelivery() {
  const query = useQuery({
    queryKey: ['advertiser', 'delivery'],
    queryFn: async (): Promise<ImpressionAnalytics> => {
      const result = await impressionClientService.getAnalytics();

      if (!result.ok) {
        throw new Error(result.error ?? 'We could not load delivery analytics.');
      }

      return (result.data as ImpressionAnalytics | undefined) ?? EMPTY;
    },
    staleTime: 60_000,
    retry: false,
  });

  return {
    delivery: query.data ?? EMPTY,
    isLoading: query.isPending,
    error: query.error instanceof Error ? query.error.message : null,
  };
}
