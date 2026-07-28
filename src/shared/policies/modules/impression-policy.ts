import type { User } from '@/shared/types/user';
import { assert, can } from '../policy-utils';
import { PERMISSIONS } from '@/shared/constants/permissions/permissions';
import { permissionDenied } from '@/shared/messages/user-messages';

export const impressionPolicy = {
  assertCanRead(actor: User): void {
    assert(actor.role, PERMISSIONS.IMPRESSIONS_READ, permissionDenied('view impression analytics'));
  },

  /** Admins read delivery for every screen; advertisers only for their own creatives. */
  canReadAny(actor: User): boolean {
    return can(actor.role, PERMISSIONS.IMPRESSIONS_READ);
  },

  assertCanReadOwn(actor: User): void {
    assert(
      actor.role,
      PERMISSIONS.IMPRESSIONS_READ_SELF,
      permissionDenied('view your delivery analytics'),
    );
  },
};
