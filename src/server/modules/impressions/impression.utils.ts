import type { ImpressionDocument } from '@/server/modules/impressions/impression.model';
import type { Impression } from '@/shared/types/impression';

export function toImpression(impression: ImpressionDocument): Impression {
  return {
    id: String(impression._id),
    billboardId: impression.billboardId,
    playlistId: impression.playlistId,
    creativeId: impression.creativeId,
    scheduleId: impression.scheduleId ?? undefined,
    occurredAt: new Date(impression.occurredAt).toISOString(),
    createdAt: impression.createdAt ? new Date(impression.createdAt).toISOString() : undefined,
  };
}
