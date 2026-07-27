import type { CreativeDocument } from '@/server/modules/creatives/creative.model';
import type { Creative, CreativeStatus, CreativeType } from '@/shared/types/creative';

export function toCreative(creative: CreativeDocument): Creative {
  return {
    id: String(creative._id),
    advertiserId: creative.advertiserId,
    name: creative.name,
    type: creative.type as CreativeType,
    assetUrl: creative.assetUrl,
    durationSeconds: creative.durationSeconds ?? undefined,
    status: creative.status as CreativeStatus,
    createdAt: creative.createdAt ? new Date(creative.createdAt).toISOString() : undefined,
    updatedAt: creative.updatedAt ? new Date(creative.updatedAt).toISOString() : undefined,
  };
}
