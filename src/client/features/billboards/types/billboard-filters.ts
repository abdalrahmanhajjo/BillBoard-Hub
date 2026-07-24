import type { BillboardStatus, BillboardType } from '@/shared/types/billboard';

export interface BillboardFilters {
  q: string;
  type: BillboardType | '';
  city: string;
  status: BillboardStatus | '';
  minPrice: string;
  maxPrice: string;
}

export const EMPTY_BILLBOARD_FILTERS: BillboardFilters = {
  q: '',
  type: '',
  city: '',
  status: '',
  minPrice: '',
  maxPrice: '',
};
