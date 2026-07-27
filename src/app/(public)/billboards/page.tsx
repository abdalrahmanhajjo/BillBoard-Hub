import type { Metadata } from 'next';
import { billboardService } from '@/server/modules/billboards/billboard.service';
import { BrowseBillboardsPage } from '@/client/features/public-catalog/pages/browse-billboards-page';
import { BILLBOARD_TYPES } from '@/shared/constants/billboard';
import type { BillboardType, PublicBillboard } from '@/shared/types/billboard';

export const metadata: Metadata = {
  title: 'Browse billboards',
  description: 'Browse and compare available billboard advertising locations across Lebanon.',
};

// Inventory changes over time, so render per-request rather than statically.
export const dynamic = 'force-dynamic';

type BrowseRouteProps = {
  searchParams: Promise<{ q?: string; type?: string }>;
};

function parseType(value?: string): BillboardType | undefined {
  return value === BILLBOARD_TYPES.DIGITAL || value === BILLBOARD_TYPES.STATIC ? value : undefined;
}

export default async function BrowseBillboardsRoute({ searchParams }: BrowseRouteProps) {
  const { q, type } = await searchParams;
  const query = (q ?? '').trim();
  const initialType = parseType(type);

  let billboards: PublicBillboard[] = [];
  let error: string | null = null;

  try {
    billboards = await billboardService.listPublic();
  } catch {
    error = 'Unable to load billboards right now.';
  }

  return (
    <BrowseBillboardsPage
      billboards={billboards}
      error={error}
      query={query || undefined}
      initialType={initialType}
    />
  );
}
