import type { User } from '@/shared/types/user';
import type { Campaign } from '@/shared/types/campaign';
import { assert, can } from '../policy-utils';
import { PERMISSIONS } from '@/shared/constants/permissions/permissions';
import { ForbiddenError } from '@/shared/http/http-error';

export const adCreativePolicy = {
  assertCanCreate(actor: User, campaign: Campaign): void {
    assert(actor.role, PERMISSIONS.CREATIVES_CREATE, 'You cannot upload ad creatives.');
    if (campaign.createdBy !== actor.id) {
      throw new ForbiddenError('You cannot add creatives to a campaign you do not own.');
    }
  },
  canReadAny(actor: User): boolean {
    return can(actor.role, PERMISSIONS.CREATIVES_READ_ANY);
  },
  assertCanAccess(actor: User, campaign: Campaign): void {
    if (this.canReadAny(actor)) return;
    if (can(actor.role, PERMISSIONS.CREATIVES_READ_SELF) && campaign.createdBy === actor.id) return;
    throw new ForbiddenError('You cannot access these creatives.');
  },
  assertCanDelete(actor: User, campaign: Campaign): void {
    assert(actor.role, PERMISSIONS.CREATIVES_DELETE_SELF, 'You cannot delete this ad creative.');
    if (campaign.createdBy !== actor.id) {
      throw new ForbiddenError('You cannot delete a creative from a campaign you do not own.');
    }
  },
  assertCanReadOwn(actor: User): void {
    assert(actor.role, PERMISSIONS.CREATIVES_READ_SELF, 'You cannot view ad creatives.');
  },
};
