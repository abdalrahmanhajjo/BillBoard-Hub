import type { DigitalSpecDocument } from '@/server/modules/billboards/digital-spec.model';
import type { DigitalSpec, ScreenStatus } from '@/shared/types/billboard';

export function toDigitalSpec(spec: DigitalSpecDocument): DigitalSpec {
  return {
    id: String(spec._id),
    billboardId: spec.billboardId,
    resolution: {
      width: spec.resolution.width,
      height: spec.resolution.height,
    },
    brightness: spec.brightness,
    slotDurationSeconds: spec.slotDurationSeconds,
    rotatingAdsCount: spec.rotatingAdsCount,
    screenStatus: spec.screenStatus as ScreenStatus,
    createdAt: spec.createdAt ? new Date(spec.createdAt).toISOString() : undefined,
    updatedAt: spec.updatedAt ? new Date(spec.updatedAt).toISOString() : undefined,
  };
}
