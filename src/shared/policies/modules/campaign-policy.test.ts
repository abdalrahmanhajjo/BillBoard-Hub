import { describe, expect, it } from 'vitest';
import { campaignPolicy } from '@/shared/policies/modules/campaign-policy';
import { adCreativePolicy } from '@/shared/policies/modules/ad-creative-policy';
import { USER_ROLES } from '@/shared/constants/user-roles';
import { ForbiddenError } from '@/shared/http/http-error';
import type { User } from '@/shared/types/user';
import type { Campaign } from '@/shared/types/campaign';
import { CAMPAIGN_STATUSES } from '@/shared/constants/campaign';

function makeUser(id: string, role: User['role']): User {
  return { id, role, email: `${id}@test.com`, firstName: 'Test', lastName: 'User', isActive: true };
}

function makeCampaign(createdBy: string): Campaign {
  return {
    id: 'campaign-1',
    name: 'Summer',
    startDate: '2026-08-01',
    endDate: '2026-08-31',
    status: CAMPAIGN_STATUSES.DRAFT,
    createdBy,
  };
}

const owner = makeUser('advertiser-1', USER_ROLES.ADVERTISER);
const otherAdvertiser = makeUser('advertiser-2', USER_ROLES.ADVERTISER);
const admin = makeUser('admin-1', USER_ROLES.ADMIN);

describe('campaignPolicy', () => {
  it('allows an advertiser to create campaigns', () => {
    expect(() => campaignPolicy.assertCanCreate(owner)).not.toThrow();
  });

  it('grants read-any only to admins', () => {
    expect(campaignPolicy.canReadAny(admin)).toBe(true);
    expect(campaignPolicy.canReadAny(owner)).toBe(false);
  });

  it('lets an advertiser access their own campaign but not another advertiser’s (IDOR guard)', () => {
    expect(() => campaignPolicy.assertCanAccess(owner, makeCampaign(owner.id))).not.toThrow();
    expect(() => campaignPolicy.assertCanAccess(owner, makeCampaign(otherAdvertiser.id))).toThrow(
      ForbiddenError,
    );
  });

  it('lets an admin access any campaign', () => {
    expect(() => campaignPolicy.assertCanAccess(admin, makeCampaign(otherAdvertiser.id))).not.toThrow();
  });

  it('blocks updating or assigning billboards to a campaign the advertiser does not own', () => {
    expect(() => campaignPolicy.assertCanUpdate(owner, makeCampaign(owner.id))).not.toThrow();
    expect(() => campaignPolicy.assertCanUpdate(owner, makeCampaign(otherAdvertiser.id))).toThrow(
      ForbiddenError,
    );
    expect(() =>
      campaignPolicy.assertCanAssignBillboards(owner, makeCampaign(otherAdvertiser.id)),
    ).toThrow(ForbiddenError);
  });
});

describe('adCreativePolicy', () => {
  it('lets an advertiser add creatives to their own campaign but not another’s', () => {
    expect(() => adCreativePolicy.assertCanCreate(owner, makeCampaign(owner.id))).not.toThrow();
    expect(() => adCreativePolicy.assertCanCreate(owner, makeCampaign(otherAdvertiser.id))).toThrow(
      ForbiddenError,
    );
  });

  it('blocks deleting a creative from a campaign the advertiser does not own', () => {
    expect(() => adCreativePolicy.assertCanDelete(owner, makeCampaign(otherAdvertiser.id))).toThrow(
      ForbiddenError,
    );
  });
});
