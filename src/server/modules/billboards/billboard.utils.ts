import type { QueryFilter } from 'mongoose';
import type { BillboardDocument } from '@/server/modules/billboards/billboard.model';
import type { BillboardSearchFilters } from '@/server/modules/billboards/billboard.types';
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

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Builds a  filter for  (location search) and  (type/budget/
 * availability/city filters). All filters are optional and combinable.
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
