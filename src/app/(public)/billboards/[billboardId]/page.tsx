import { cache } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BILLBOARD_TYPES } from '@/shared/constants/billboard';
import { billboardService } from '@/server/modules/billboards/billboard.service';
import { digitalSpecService } from '@/server/modules/billboards/digital-spec.service';
import { isNotFoundError } from '@/server/http/is-not-found-error';
import type { PublicBillboard, PublicDigitalSpec } from '@/shared/types/billboard';
import { BillboardDetailsPage } from '@/client/features/public-catalog/pages/billboard-details-page';
import { JsonLd } from '@/client/ui/components/seo/json-ld';
import { createPageMetadata } from '@/shared/seo/metadata';
import { billboardProductSchema, breadcrumbSchema } from '@/shared/seo/schema';

type RouteParams = {
  params: Promise<{ billboardId: string }>;
};

// Inventory changes over time, so render per-request rather than statically.
export const dynamic = 'force-dynamic';

// Deduped per request so generateMetadata and the page share one DB read.
const loadPublicBillboard = cache((billboardId: string) =>
  billboardService.getPublicById(billboardId),
);

async function loadBillboard(billboardId: string): Promise<PublicBillboard> {
  try {
    return await loadPublicBillboard(billboardId);
  } catch (error) {
    if (isNotFoundError(error)) {
      notFound();
    }
    throw error;
  }
}

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { billboardId } = await params;

  try {
    const billboard = await loadPublicBillboard(billboardId);

    const format = billboard.type === BILLBOARD_TYPES.DIGITAL ? 'Digital' : 'Static';

    return createPageMetadata({
      title: `${billboard.name} Billboard in ${billboard.location.city}`,
      description:
        billboard.description ??
        `View this ${format.toLowerCase()} billboard in ${billboard.location.city}, Lebanon. Check dimensions, monthly traffic, pricing and campaign availability.`,
      path: `/billboards/${billboard.id}`,
      keywords: [
        `billboard advertising ${billboard.location.city}`,
        `${format.toLowerCase()} billboard Lebanon`,
        `billboard rental ${billboard.location.city}`,
      ],
      image: billboard.images[0],
      imageAlt: `${billboard.name} ${format.toLowerCase()} billboard in ${billboard.location.city}, Lebanon`,
    });
  } catch {
    return { title: 'Billboard' };
  }
}

export default async function BillboardDetailsRoute({ params }: RouteParams) {
  const { billboardId } = await params;
  const billboard = await loadBillboard(billboardId);

  let spec: PublicDigitalSpec | null = null;
  if (billboard.type === BILLBOARD_TYPES.DIGITAL) {
    try {
      spec = await digitalSpecService.getPublicByBillboard(billboardId);
    } catch {
      // The spec is supplementary; never fail the whole page over it.
      spec = null;
    }
  }

  let relatedBillboards: PublicBillboard[] = [];
  try {
    relatedBillboards = (await billboardService.listPublic())
      .filter((item) => item.id !== billboardId)
      .sort((a, b) => {
        const sameCityDifference =
          Number(b.location.city === billboard.location.city) -
          Number(a.location.city === billboard.location.city);
        return sameCityDifference || Number(b.isAvailable) - Number(a.isAvailable);
      })
      .slice(0, 3);
  } catch {
    relatedBillboards = [];
  }

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Billboards', path: '/billboards' },
            { name: billboard.name, path: `/billboards/${billboard.id}` },
          ]),
          billboardProductSchema(billboard),
        ]}
      />
      <BillboardDetailsPage
        billboard={billboard}
        spec={spec}
        relatedBillboards={relatedBillboards}
      />
    </>
  );
}
