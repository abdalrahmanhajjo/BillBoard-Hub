import type { User } from '@/shared/types/user';
import type { Campaign } from '@/shared/types/campaign';
import { assert, can } from '../policy-utils';
import { PERMISSIONS } from '@/shared/constants/permissions/permissions';
import { ForbiddenError } from '@/shared/http/http-error';

export const campaignPolicy = {
  assertCanCreate(actor: User): void {
    assert(actor.role, PERMISSIONS.CAMPAIGNS_CREATE, 'You cannot create campaigns.');
  },
  canReadAny(actor: User): boolean {
    return can(actor.role, PERMISSIONS.CAMPAIGNS_READ_ANY);
  },
  assertCanReadOwn(actor: User): void {
    assert(actor.role, PERMISSIONS.CAMPAIGNS_READ_SELF, 'You cannot view campaigns.');
  },
  assertCanAccess(actor: User, campaign: Campaign): void {
    if (this.canReadAny(actor)) return;
    if (can(actor.role, PERMISSIONS.CAMPAIGNS_READ_SELF) && campaign.createdBy === actor.id) return;
    throw new ForbiddenError('You cannot access this campaign.');
  },
  assertCanUpdate(actor: User, campaign: Campaign): void {
    assert(actor.role, PERMISSIONS.CAMPAIGNS_UPDATE_SELF, 'You cannot update this campaign.');
    if (campaign.createdBy !== actor.id) {
      throw new ForbiddenError('You cannot update a campaign you do not own.');
    }
  },
  assertCanAssignBillboards(actor: User, campaign: Campaign): void {
    assert(
      actor.role,
      PERMISSIONS.CAMPAIGNS_ASSIGN_BILLBOARDS,
      'You cannot assign billboards to campaigns.',
    );
    if (campaign.createdBy !== actor.id) {
      throw new ForbiddenError('You cannot assign billboards to a campaign you do not own.');
    }
  },
};
