import type { AdCreativeDocument } from '@/server/modules/ad-creatives/ad-creative.model';
import type { AdCreative, AdCreativeType } from '@/shared/types/ad-creative';

export function toAdCreative(creative: AdCreativeDocument): AdCreative {
  return {
    id: String(creative._id),
    campaignId: creative.campaignId,
    url: creative.url,
    fileType: creative.fileType as AdCreativeType,
    durationSeconds: creative.durationSeconds ?? undefined,
    createdBy: creative.createdBy,
    createdAt: creative.createdAt ? new Date(creative.createdAt).toISOString() : undefined,
    updatedAt: creative.updatedAt ? new Date(creative.updatedAt).toISOString() : undefined,
  };
}
