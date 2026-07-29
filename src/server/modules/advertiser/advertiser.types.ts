import type { CreateAdvertiserSchemaOutput } from '@/shared/contracts/advertiser/advertiser.schema';

export interface AdvertiserRecord extends CreateAdvertiserSchemaOutput {
  /** The user account that owns this profile; unique across the collection. */
  userId: string;
}
