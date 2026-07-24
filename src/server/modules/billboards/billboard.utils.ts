import type { BillboardDocument } from '@/server/modules/billboards/billboard.model';
import type {
  Billboard,
  BillboardStatus,
  BillboardType,
  DimensionUnit,
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
    status: billboard.status as BillboardStatus,
    images: billboard.images ?? [],
    createdAt: billboard.createdAt ? new Date(billboard.createdAt).toISOString() : undefined,
    updatedAt: billboard.updatedAt ? new Date(billboard.updatedAt).toISOString() : undefined,
  };
}
