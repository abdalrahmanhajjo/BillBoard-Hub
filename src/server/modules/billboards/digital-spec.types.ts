import { UpsertDigitalSpecSchemaOutput } from '@/shared/contracts/billboard/digital-spec.schema';

export interface DigitalSpecRecord extends UpsertDigitalSpecSchemaOutput {
  billboardId: string;
}
