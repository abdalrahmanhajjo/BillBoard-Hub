import { campaignRepository } from '@/server/modules/campaigns/campaign.repository';
import { campaignBillboardRepository } from '@/server/modules/campaigns/campaign-billboard.repository';
import { toCampaign } from '@/server/modules/campaigns/campaign.utils';
import { billboardService } from '@/server/modules/billboards/billboard.service';
import { authorizationPolicy } from '@/shared/policies';
import { NotFoundError } from '@/shared/http/http-error';
import { CAMPAIGN_STATUSES } from '@/shared/constants/campaign';
import type {
  CreateCampaignSchemaOutput,
  UpdateCampaignSchemaOutput,
} from '@/shared/contracts/campaign/campaign.schema';
import type { AssignBillboardsSchemaOutput } from '@/shared/contracts/campaign/campaign-billboard.schema';
import type { Campaign } from '@/shared/types/campaign';
import type { Billboard } from '@/shared/types/billboard';
import type { User } from '@/shared/types/user';

export const campaignService = {
  async create(input: CreateCampaignSchemaOutput, actor: User): Promise<Campaign> {
    authorizationPolicy.campaign.assertCanCreate(actor);
    const created = await campaignRepository.create({
      ...input,
      status: CAMPAIGN_STATUSES.DRAFT,
      createdBy: actor.id,
    });
    return toCampaign(created);
  },

  async list(actor: User): Promise<Campaign[]> {
    let filter: { createdBy?: string } = {};
    if (!authorizationPolicy.campaign.canReadAny(actor)) {
      authorizationPolicy.campaign.assertCanReadOwn(actor);
      filter = { createdBy: actor.id };
    }
    const campaigns = await campaignRepository.findMany(filter);
    return campaigns.map(toCampaign);
  },

  async getById(actor: User, campaignId: string): Promise<Campaign> {
    const campaign = await campaignRepository.findById(campaignId);
    if (!campaign) {
      throw new NotFoundError('Campaign not found.');
    }
    const mapped = toCampaign(campaign);
    authorizationPolicy.campaign.assertCanAccess(actor, mapped);
    return mapped;
  },

  async update(
    actor: User,
    campaignId: string,
    input: UpdateCampaignSchemaOutput,
  ): Promise<Campaign> {
    const existing = await this.getById(actor, campaignId);
    authorizationPolicy.campaign.assertCanUpdate(actor, existing);
    const updated = await campaignRepository.updateById(campaignId, input);
    if (!updated) {
      throw new NotFoundError('Campaign not found.');
    }
    return toCampaign(updated);
  },

  /**
   * BB-25: assigns one or more billboards to a campaign. Each billboard id is
   * validated through billboardService.getById so only real, visible
   * billboards can be linked.
   */
  async assignBillboards(
    actor: User,
    campaignId: string,
    input: AssignBillboardsSchemaOutput,
  ): Promise<Billboard[]> {
    const campaign = await this.getById(actor, campaignId);
    authorizationPolicy.campaign.assertCanAssignBillboards(actor, campaign);

    await Promise.all(
      input.billboardIds.map((billboardId) => billboardService.getById(actor, billboardId)),
    );

    await campaignBillboardRepository.assignMany(campaignId, input.billboardIds);
    return this.listAssignedBillboards(actor, campaignId);
  },

  async listAssignedBillboards(actor: User, campaignId: string): Promise<Billboard[]> {
    const campaign = await this.getById(actor, campaignId);
    authorizationPolicy.campaign.assertCanAccess(actor, campaign);
    const assignments = await campaignBillboardRepository.findByCampaignId(campaignId);
    return Promise.all(
      assignments.map((assignment) => billboardService.getById(actor, assignment.billboardId)),
    );
  },
};
