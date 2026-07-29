import { campaignRepository } from '@/server/modules/campaigns/campaign.repository';
import { campaignBillboardRepository } from '@/server/modules/campaigns/campaign-billboard.repository';
import { toCampaign } from '@/server/modules/campaigns/campaign.utils';
import { billboardService } from '@/server/modules/billboards/billboard.service';
import { authorizationPolicy } from '@/shared/policies';
import { NotFoundError } from '@/shared/http/http-error';
import { CAMPAIGN_STATUSES } from '@/shared/constants/campaign';
import type {
  CreateCampaignSchemaInput,
  UpdateCampaignSchemaInput,
} from '@/shared/contracts/campaign/campaign.schema';
import type { AssignBillboardsSchemaOutput } from '@/shared/contracts/campaign/campaign-billboard.schema';
import type { Campaign } from '@/shared/types/campaign';
import type { Billboard } from '@/shared/types/billboard';
import type { User } from '@/shared/types/user';
import { advertiserService } from '../advertiser/advertiser.service';

export const campaignService = {
  async create(input: CreateCampaignSchemaInput, actor: User): Promise<Campaign> {
    const advertiser = await advertiserService.getAdvertiserByUser(actor);
    if (!advertiser) {
      throw new NotFoundError('Advertiser profile not found for the user.');
    }

    authorizationPolicy.campaign.assertCanCreate(actor);
    const created = await campaignRepository.create({
      ...input,
      status: CAMPAIGN_STATUSES.DRAFT,
      createdBy: advertiser.id.toString(),
    });
    return toCampaign(created);
  },

  async list(actor: User): Promise<Campaign[]> {
    let filter: { createdBy?: string } = {};
    if (!authorizationPolicy.campaign.canReadAny(actor)) {
      const advertiser = await advertiserService.getAdvertiserByUser(actor);
      if (!advertiser) {
        throw new NotFoundError('Advertiser profile not found for the user.');
      }
      authorizationPolicy.campaign.assertCanReadOwn(actor, advertiser.userId.toString());
      filter = { createdBy: advertiser.id.toString() };
    }
    const campaigns = await campaignRepository.findMany(filter);
    return campaigns.map(toCampaign);
  },

  async getById(actor: User, campaignId: string): Promise<Campaign> {
    const campaign = await campaignRepository.findById(campaignId);
    if (!campaign) {
      throw new NotFoundError('Campaign not found.');
    }

    const advertiser = await advertiserService.getAdvertiserByUser(actor);
    if (!authorizationPolicy.campaign.canReadAny(actor)) {
      if (!advertiser) {
        throw new NotFoundError('Advertiser profile not found for the user.');
      }
      authorizationPolicy.campaign.assertCanReadOwn(actor, advertiser.userId.toString());
      if (campaign.createdBy.toString() !== advertiser.id.toString()) {
        throw new NotFoundError('You do not have permission to access this campaign.');
      }
    }

    const mapped = toCampaign(campaign);
    return mapped;
  },

  async update(
    actor: User,
    campaignId: string,
    input: UpdateCampaignSchemaInput,
  ): Promise<Campaign> {
    const advertiser = await advertiserService.getAdvertiserByUser(actor);
    if (!advertiser) {
      throw new NotFoundError('Advertiser profile not found for the user.');
    }
    authorizationPolicy.campaign.assertCanUpdate(actor, advertiser.userId.toString());
    const campaign = await campaignRepository.findById(campaignId);
    if (!campaign) {
      throw new NotFoundError('Campaign not found.');
    }
    if (campaign.createdBy.toString() !== advertiser.id.toString()) {
      throw new NotFoundError('You do not have permission to update this campaign.');
    }
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
    const advertiser = await advertiserService.getAdvertiserByUser(actor);
    if (!advertiser) {
      throw new NotFoundError('Advertiser profile not found for the user.');
    }
    const campaign = await campaignRepository.findById(campaignId);
    if (!campaign) {
      throw new NotFoundError('Campaign not found.');
    }
    if (campaign.createdBy.toString() !== advertiser.id.toString()) {
      throw new NotFoundError('You do not have permission to assign billboards to this campaign.');
    }
    authorizationPolicy.campaign.assertCanAssignBillboards(actor, advertiser.userId.toString());

    await Promise.all(
      input.billboardIds.map((billboardId) => billboardService.getById(actor, billboardId)),
    );

    await campaignBillboardRepository.assignMany(campaignId, input.billboardIds);
    return this.listAssignedBillboards(actor, campaignId);
  },

  async listAssignedBillboards(actor: User, campaignId: string): Promise<Billboard[]> {
    const advertiser = await advertiserService.getAdvertiserByUser(actor);
    if (!advertiser) {
      throw new NotFoundError('Advertiser profile not found for the user.');
    }
    const campaign = await campaignRepository.findById(campaignId);
    if (!campaign) {
      throw new NotFoundError('Campaign not found.');
    }
    if (campaign.createdBy.toString() !== advertiser.id.toString()) {
      throw new NotFoundError(
        'You do not have permission to view billboards assigned to this campaign.',
      );
    }
    authorizationPolicy.campaign.assertCanAccess(actor, advertiser.userId.toString());
    const assignments = await campaignBillboardRepository.findByCampaignId(campaignId);
    return Promise.all(
      assignments.map((assignment) =>
        billboardService.getById(actor, assignment.billboardId.toString()),
      ),
    );
  },
};
