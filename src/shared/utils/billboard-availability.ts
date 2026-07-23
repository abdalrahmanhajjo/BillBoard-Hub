import { BILLBOARD_STATUSES } from '@/shared/constants/billboard';
import type { BillboardStatus } from '@/shared/types/billboard';

/**
 * Single source of truth for whether a billboard can be reserved/booked.
 *
 * Only `available` billboards are bookable. The bookings module must call this
 * (or `billboardService.assertBookable`) so customers cannot reserve
 * unavailable spaces.
 */
export function isBillboardBookable(status: BillboardStatus): boolean {
  return status === BILLBOARD_STATUSES.AVAILABLE;
}
