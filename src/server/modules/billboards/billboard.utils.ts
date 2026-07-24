import type { QueryFilter } from 'mongoose';
import type { BillboardDocument } from '@/server/modules/billboards/billboard.model';
import type { BillboardSearchFilters } from '@/server/modules/billboards/billboard.types';
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

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Builds a MongoDB filter for free-text search (name/code/location) and the
 * type / city / availability / budget filters. All are optional and combinable.
 */
export function buildBillboardFilterQuery(
  filters: BillboardSearchFilters,
): QueryFilter<BillboardDocument> {
  const query: QueryFilter<BillboardDocument> = {};

  if (filters.q) {
    const pattern = new RegExp(escapeRegExp(filters.q), 'i');
    query.$or = [
      { name: pattern },
      { code: pattern },
      { 'location.address': pattern },
      { 'location.city': pattern },
      { 'location.country': pattern },
    ];
  }

  if (filters.type) {
    query.type = filters.type;
  }

  if (filters.city) {
    query['location.city'] = new RegExp(escapeRegExp(filters.city), 'i');
  }

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    query.monthlyPrice = {
      ...(filters.minPrice !== undefined ? { $gte: filters.minPrice } : {}),
      ...(filters.maxPrice !== undefined ? { $lte: filters.maxPrice } : {}),
    };
  }

  return query;
}
