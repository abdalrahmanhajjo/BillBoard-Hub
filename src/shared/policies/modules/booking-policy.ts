import type { User, UserRole } from '@/shared/types/user';
import { assert, can } from '../policy-utils';
import { PERMISSIONS } from '@/shared/constants/permissions/permissions';
import { permissionDenied } from '@/shared/messages/user-messages';

export const bookingPolicy = {
  assertCanCreate(actor: User): void {
    assert(actor.role, PERMISSIONS.BOOKINGS_CREATE, permissionDenied('submit reservations'));
  },

  assertCanRead(actor: User): void {
    assert(actor.role, PERMISSIONS.BOOKINGS_READ, permissionDenied('view reservations'));
  },

  assertCanModerate(actor: User): void {
    assert(actor.role, PERMISSIONS.BOOKINGS_MODERATE, permissionDenied('review reservations'));
  },

  /** Admins see every reservation; everyone else is scoped to their own. */
  canModerate(role: UserRole): boolean {
    return can(role, PERMISSIONS.BOOKINGS_MODERATE);
  },
};
