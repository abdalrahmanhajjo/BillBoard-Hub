import type { DigitalSpecDocument } from '@/server/modules/billboards/digital-spec.model';
import type { DigitalSpec, PublicDigitalSpec, ScreenStatus } from '@/shared/types/billboard';

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

/**
 * Projects a digital spec down to the public-safe capabilities shown on the
 * storefront, dropping operational fields such as `screenStatus`.
 */
export function toPublicDigitalSpec(spec: DigitalSpec): PublicDigitalSpec {
  return {
    resolution: spec.resolution,
    brightness: spec.brightness,
    slotDurationSeconds: spec.slotDurationSeconds,
    rotatingAdsCount: spec.rotatingAdsCount,
  };
}
