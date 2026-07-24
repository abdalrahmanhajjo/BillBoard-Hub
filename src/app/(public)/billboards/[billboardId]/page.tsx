import { cache } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BILLBOARD_TYPES } from '@/shared/constants/billboard';
import { NotFoundError } from '@/shared/http/http-error';
import { billboardService } from '@/server/modules/billboards/billboard.service';
import { digitalSpecService } from '@/server/modules/billboards/digital-spec.service';
import type { PublicBillboard, PublicDigitalSpec } from '@/shared/types/billboard';
import { BillboardDetailsPage } from '@/client/features/public-catalog/pages/billboard-details-page';

type RouteParams = {
  params: Promise<{ billboardId: string }>;
};

// Inventory changes over time, so render per-request rather than statically.
export const dynamic = 'force-dynamic';

function isNotFound(error: unknown): boolean {
  return error instanceof NotFoundError || (error as { name?: string })?.name === 'CastError';
}

// Deduped per request so generateMetadata and the page share one DB read.
const loadPublicBillboard = cache((billboardId: string) =>
  billboardService.getPublicById(billboardId),
);

async function loadBillboard(billboardId: string): Promise<PublicBillboard> {
  try {
    return await loadPublicBillboard(billboardId);
  } catch (error) {
    if (isNotFound(error)) {
      notFound();
    }
    throw error;
  }
}

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { billboardId } = await params;

  try {
    const billboard = await loadPublicBillboard(billboardId);

    return {
      title: `${billboard.name} | BillBoard Hub`,
      description:
        billboard.description ??
        `${billboard.name} in ${billboard.location.city}, ${billboard.location.country}.`,
    };
  } catch {
    return { title: 'Billboard | BillBoard Hub' };
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

  return <BillboardDetailsPage billboard={billboard} spec={spec} />;
}
