import type { AdvertiserDocument } from '@/server/modules/advertiser/advertiser.model';
import type { Advertiser } from '@/shared/types/advertiser';

export function toAdvertiser(creative: AdvertiserDocument): Advertiser {
  return {
    id: String(creative._id),
    userId: creative.userId.toString(),
    companyName: creative.companyName,
    phone: creative.phone,
    address: creative.address,
  };
}
