import { BOOKING_STATUSES, PAYMENT_STATUSES } from '@/shared/constants/booking';
import type { Booking } from '@/shared/types/booking';
import type { Campaign } from '@/shared/types/campaign';
import type { Creative } from '@/shared/types/creative';
import type { User } from '@/shared/types/user';

/**
 * Client-side mirror of the rules the server already enforces.
 *
 * Every predicate here corresponds to a concrete check in a service or policy —
 * the list below records where — so the UI only offers actions the API will
 * actually accept. Anything the backend has no endpoint for is absent by
 * design, not an oversight.
 */

export type ActionVerdict = {
  allowed: boolean;
  /** Why the action is unavailable, shown as the disabled control's tooltip. */
  reason?: string;
};

const ALLOWED = { allowed: true } as const;

/**
 * `bookingService.cancel` accepts only pending/approved reservations and
 * refuses any that have taken money.
 */
export function canCancelBooking(booking: Booking): ActionVerdict {
  const cancellableStatuses: string[] = [BOOKING_STATUSES.PENDING, BOOKING_STATUSES.APPROVED];

  if (!cancellableStatuses.includes(booking.status)) {
    return { allowed: false, reason: 'Only pending or approved reservations can be cancelled.' };
  }

  const settledPayments: string[] = [
    PAYMENT_STATUSES.PAID,
    PAYMENT_STATUSES.PARTIALLY_PAID,
    PAYMENT_STATUSES.REFUND_PENDING,
  ];
  if (settledPayments.includes(booking.paymentStatus)) {
    return {
      allowed: false,
      reason: 'This reservation has received payment. An administrator must refund it first.',
    };
  }

  return ALLOWED;
}

/** `campaignPolicy.assertCanUpdate` requires ownership. */
export function canEditCampaign(campaign: Campaign, actor?: Pick<User, 'id'>): ActionVerdict {
  if (!actor) {
    return { allowed: false, reason: 'Sign in again to edit this campaign.' };
  }
  if (campaign.createdBy !== actor.id) {
    return { allowed: false, reason: 'You can only edit campaigns you created.' };
  }
  return ALLOWED;
}

/**
 * There is no DELETE route for campaigns, so the UI never offers one. Completed
 * campaigns are archived by setting status instead.
 */
export const CAMPAIGN_DELETE_SUPPORTED = false;

/** `creativeService.update` loads the creative through the owner/moderator gate. */
export function canEditCreative(creative: Creative, actor?: Pick<User, 'id'>): ActionVerdict {
  if (!actor) {
    return { allowed: false, reason: 'Sign in again to edit this creative.' };
  }
  if (creative.advertiserId !== actor.id) {
    return { allowed: false, reason: 'You can only edit creatives you uploaded.' };
  }
  return ALLOWED;
}

/** `creativeService.delete` applies the same ownership gate as update. */
export function canDeleteCreative(creative: Creative, actor?: Pick<User, 'id'>): ActionVerdict {
  if (!actor) {
    return { allowed: false, reason: 'Sign in again to delete this creative.' };
  }
  if (creative.advertiserId !== actor.id) {
    return { allowed: false, reason: 'You can only delete creatives you uploaded.' };
  }
  return ALLOWED;
}
