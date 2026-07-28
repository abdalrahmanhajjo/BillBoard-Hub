'use client';

import { useQuery } from '@tanstack/react-query';
import { bookingClientService } from '@/client/features/bookings/services/booking-client.service';
import { campaignClientService } from '@/client/features/campaigns/services/campaign-client.service';
import { creativeClientService } from '@/client/features/creatives/services/creative-client.service';
import type { Booking } from '@/shared/types/booking';
import type { Campaign } from '@/shared/types/campaign';
import type { Creative } from '@/shared/types/creative';

export type AdvertiserWorkspace = {
  bookings: Booking[];
  campaigns: Campaign[];
  creatives: Creative[];
};

const EMPTY: AdvertiserWorkspace = { bookings: [], campaigns: [], creatives: [] };

async function fetchWorkspace(): Promise<AdvertiserWorkspace> {
  const [bookingResult, campaignResult, creativeResult] = await Promise.all([
    bookingClientService.list(),
    campaignClientService.list(),
    creativeClientService.list(),
  ]);

  const failure = [bookingResult, campaignResult, creativeResult].find((result) => !result.ok);
  if (failure) {
    throw new Error(failure.error ?? 'We could not load your workspace. Try again.');
  }

  return {
    bookings: (bookingResult.data as { bookings?: Booking[] } | undefined)?.bookings ?? [],
    campaigns: (campaignResult.data as { campaigns?: Campaign[] } | undefined)?.campaigns ?? [],
    creatives: (creativeResult.data as { creatives?: Creative[] } | undefined)?.creatives ?? [],
  };
}

/**
 * Single load of everything the advertiser workspace summarises.
 *
 * The API exposes no aggregate endpoint for advertisers, so the dashboard,
 * invoices, and reports screens all derive their figures from these three
 * owner-scoped lists. Sharing one query key means moving between those screens
 * reuses the cached result instead of refetching.
 */
export function useAdvertiserWorkspace() {
  const query = useQuery({
    queryKey: ['advertiser', 'workspace'],
    queryFn: fetchWorkspace,
    staleTime: 30_000,
  });

  const data = query.data ?? EMPTY;

  return {
    ...data,
    status: query.isPending
      ? ('loading' as const)
      : query.isError
        ? ('error' as const)
        : ('ready' as const),
    error: query.error instanceof Error ? query.error.message : null,
    reload: () => void query.refetch(),
  };
}
