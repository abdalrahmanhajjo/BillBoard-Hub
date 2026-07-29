import type { Metadata } from 'next';
import { billboardService } from '@/server/modules/billboards/billboard.service';
import { BrowseBillboardsPage } from '@/client/features/public-catalog/pages/browse-billboards-page';
import { BILLBOARD_TYPES } from '@/shared/constants/billboard';
import type { BillboardType, PublicBillboard } from '@/shared/types/billboard';
import { createPageMetadata } from '@/shared/seo/metadata';

// Inventory changes over time, so render per-request rather than statically.
export const dynamic = 'force-dynamic';

type BrowseRouteProps = {
  searchParams: Promise<{ q?: string; type?: string }>;
};

export async function generateMetadata({ searchParams }: BrowseRouteProps): Promise<Metadata> {
  const { q, type } = await searchParams;
  const requestedType = parseType(type);
  const hasSearch = Boolean(q?.trim());
  const label = requestedType === BILLBOARD_TYPES.DIGITAL ? 'Digital' : 'Static';

  return createPageMetadata({
    title: requestedType
      ? `${label} Billboards for Advertising in Lebanon`
      : 'Billboards for Advertising Across Lebanon',
    description: requestedType
      ? `Browse ${label.toLowerCase()} billboard locations across Beirut and Lebanon. Compare dimensions, estimated traffic, availability and monthly rates.`
      : 'Browse verified static and digital billboard locations across Lebanon. Compare cities, formats, traffic estimates, availability and monthly rates.',
    path: requestedType ? `/billboards?type=${requestedType}` : '/billboards',
    keywords: requestedType
      ? [
          `${label.toLowerCase()} billboards Lebanon`,
          `${label.toLowerCase()} billboard advertising Beirut`,
          'outdoor advertising Lebanon',
        ]
      : [
          'billboards Lebanon',
          'billboard rental Beirut',
          'outdoor advertising locations Lebanon',
          'digital billboard Lebanon',
        ],
    noIndex: hasSearch,
  });
}

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
    error = 'We could not load billboards right now. Refresh the page to try again.';
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
