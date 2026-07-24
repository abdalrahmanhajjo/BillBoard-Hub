import { CreateBillboardSchemaOutput } from '@/shared/contracts/billboard/billboard.schema';
import type { BillboardStatus, BillboardType } from '@/shared/types/billboard';

export interface BillboardRecord extends CreateBillboardSchemaOutput {
  createdBy?: string;
}

export interface BillboardSearchFilters {
  q?: string;
  type?: BillboardType;
  city?: string;
  status?: BillboardStatus;
  minPrice?: number;
  maxPrice?: number;
}
