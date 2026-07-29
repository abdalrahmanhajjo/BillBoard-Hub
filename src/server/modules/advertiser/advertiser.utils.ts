import type { AdvertiserDocument } from './advertiser.model';
import type { Advertiser } from '@/shared/types/advertiser';

function toIsoString(value: Date | null | undefined): string | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

export function toAdvertiser(advertiser: AdvertiserDocument): Advertiser {
  return {
    id: String(advertiser._id),
    userId: advertiser.userId,
    companyName: advertiser.companyName,
    phone: advertiser.phone,
    address: advertiser.address,
    createdAt: toIsoString(advertiser.createdAt),
    updatedAt: toIsoString(advertiser.updatedAt),
  };
}
