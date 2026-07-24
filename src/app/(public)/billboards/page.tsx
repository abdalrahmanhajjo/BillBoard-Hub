import type { Metadata } from 'next';
import { billboardService } from '@/server/modules/billboards/billboard.service';
import { BrowseBillboardsPage } from '@/client/features/public-catalog/pages/browse-billboards-page';
import type { PublicBillboard } from '@/shared/types/billboard';

export const metadata: Metadata = {
  title: 'Browse billboards',
  description: 'Browse and compare available billboard advertising locations across Lebanon.',
};

// Inventory changes over time, so render per-request rather than statically.
export const dynamic = 'force-dynamic';

type BrowseRouteProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function BrowseBillboardsRoute({ searchParams }: BrowseRouteProps) {
  const { q } = await searchParams;
  const query = (q ?? '').trim();

  let billboards: PublicBillboard[] = [];
  let error: string | null = null;

  try {
    billboards = await billboardService.listPublic();
  } catch {
    error = 'Unable to load billboards right now.';
  }

  return <BrowseBillboardsPage billboards={billboards} error={error} query={query || undefined} />;
}
