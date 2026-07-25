import type { CreateCreativeSchemaOutput } from '@/shared/contracts/creative/creative.schema';
import type { CreativeStatus } from '@/shared/types/creative';

export interface CreativeRecord extends CreateCreativeSchemaOutput {
  advertiserId: string;
  status: CreativeStatus;
}
