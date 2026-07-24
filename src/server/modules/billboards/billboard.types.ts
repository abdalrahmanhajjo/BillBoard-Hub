import { CreateBillboardSchemaOutput } from '@/shared/contracts/billboard/billboard.schema';

export interface BillboardRecord extends CreateBillboardSchemaOutput {
  createdBy?: string;
}
