import type { BillboardDocument } from '@/server/modules/billboards/billboard.model';
import { isBillboardBookable } from '@/shared/utils/billboard-availability';
import type {
  Billboard,
  BillboardStatus,
  BillboardType,
  DimensionUnit,
  PublicBillboard,
} from '@/shared/types/billboard';

export function toBillboard(billboard: BillboardDocument): Billboard {
  return {
    id: String(billboard._id),
    name: billboard.name,
    code: billboard.code,
    description: billboard.description ?? undefined,
    type: billboard.type as BillboardType,
    location: {
      address: billboard.location.address,
      city: billboard.location.city,
      country: billboard.location.country,
    },
    dimensions: {
      width: billboard.dimensions.width,
      height: billboard.dimensions.height,
      unit: billboard.dimensions.unit as DimensionUnit,
    },
    monthlyPrice: billboard.monthlyPrice,
    trafficCount: billboard.trafficCount ?? undefined,
    status: billboard.status as BillboardStatus,
    images: billboard.images ?? [],
    createdAt: billboard.createdAt ? new Date(billboard.createdAt).toISOString() : undefined,
    updatedAt: billboard.updatedAt ? new Date(billboard.updatedAt).toISOString() : undefined,
  };
}

/**
 * Projects a billboard down to the public-safe fields used by the storefront,
 * collapsing the internal status into a boolean availability flag.
 */
export function toPublicBillboard(billboard: Billboard): PublicBillboard {
  return {
    id: billboard.id,
    name: billboard.name,
    description: billboard.description,
    type: billboard.type,
    location: billboard.location,
    dimensions: billboard.dimensions,
    monthlyPrice: billboard.monthlyPrice,
    trafficCount: billboard.trafficCount,
    images: billboard.images,
    isAvailable: isBillboardBookable(billboard.status),
  };
}
