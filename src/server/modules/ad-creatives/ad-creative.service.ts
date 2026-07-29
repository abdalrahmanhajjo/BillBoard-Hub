import { adCreativeRepository } from '@/server/modules/ad-creatives/ad-creative.repository';
import { toAdCreative } from '@/server/modules/ad-creatives/ad-creative.utils';
import { campaignRepository } from '@/server/modules/campaigns/campaign.repository';
import type { AdCreativeWithCampaign } from '@/shared/types/ad-creative';
import { campaignService } from '@/server/modules/campaigns/campaign.service';
import { advertiserService } from '@/server/modules/advertiser/advertiser.service';
import { authorizationPolicy } from '@/shared/policies';
import { NotFoundError } from '@/shared/http/http-error';
import type {
  CreateAdCreativeSchemaInput,
  UpdateAdCreativeSchemaInput,
} from '@/shared/contracts/ad-creative/ad-creative.schema';
import type { AdCreative } from '@/shared/types/ad-creative';
import type { User } from '@/shared/types/user';

export const adCreativeService = {
  async create(actor: User, input: CreateAdCreativeSchemaInput): Promise<AdCreative> {
    const campaign = await campaignService.getById(actor, input.campaignId);
    const advertiserId = campaign.createdBy.toString();
    const advertiser = await advertiserService.getById(actor, advertiserId);
    authorizationPolicy.adCreative.assertCanCreate(actor, advertiser.userId.toString());

    const created = await adCreativeRepository.create(input);
    return toAdCreative(created);
  },

  async listByCampaign(actor: User, campaignId: string): Promise<AdCreative[]> {
    const campaign = await campaignService.getById(actor, campaignId);
    const advertiserId = campaign.createdBy.toString();
    const advertiser = await advertiserService.getById(actor, advertiserId);
    authorizationPolicy.adCreative.assertCanRead(actor, advertiser.userId.toString());
    const creatives = await adCreativeRepository.findByCampaignId(campaignId);
    return creatives.map(toAdCreative);
  },

  async listMine(actor: User): Promise<AdCreativeWithCampaign[]> {
    let filter: { campaignIds?: string[] } = {};

    if (!authorizationPolicy.adCreative.canReadAny(actor)) {
      const advertiser = await advertiserService.getAdvertiserByUser(actor);
      if (!advertiser) {
        throw new NotFoundError('Advertiser not found for the current user.');
      }
      authorizationPolicy.adCreative.assertCanRead(actor, advertiser.userId.toString());
      const campaignIds = await campaignRepository.findMany({
        createdBy: advertiser.id.toString(),
      });
      filter = { campaignIds: campaignIds.map((campaign) => campaign._id.toString()) };
    }
    const creatives = await adCreativeRepository.findMany(filter);
    if (creatives.length === 0) return [];

    const campaignIds = Array.from(
      new Set(creatives.map((creative) => creative.campaignId.toString())),
    );
    const campaigns = await campaignRepository.findManyByIds(campaignIds);
    const campaignNameById = new Map(
      campaigns.map((campaign) => [String(campaign._id), campaign.name]),
    );

    return creatives.map((creative) => ({
      ...toAdCreative(creative),
      campaignName: campaignNameById.get(creative.campaignId.toString()) ?? 'Unknown campaign',
    }));
  },

  async delete(actor: User, creativeId: string): Promise<AdCreative> {
    const advertiser = await advertiserService.getAdvertiserByUser(actor);
    if (!advertiser) {
      throw new NotFoundError('Advertiser not found for the current user.');
    }
    authorizationPolicy.adCreative.assertCanDelete(actor, advertiser.userId.toString());
    const deleted = await adCreativeRepository.deleteById(creativeId);
    if (!deleted) {
      throw new NotFoundError('Ad creative not found.');
    }
    return toAdCreative(deleted);
  },

  async getById(actor: User, creativeId: string): Promise<AdCreative> {
    const advertiser = await advertiserService.getAdvertiserByUser(actor);
    if (!advertiser) {
      throw new NotFoundError('Advertiser not found for the current user.');
    }
    authorizationPolicy.adCreative.assertCanRead(actor, advertiser.userId.toString());
    const creative = await adCreativeRepository.findById(creativeId);
    if (!creative) {
      throw new NotFoundError('Ad creative not found.');
    }
    return toAdCreative(creative);
  },

  async update(
    actor: User,
    creativeId: string,
    input: UpdateAdCreativeSchemaInput,
  ): Promise<AdCreative> {
    const advertiser = await advertiserService.getAdvertiserByUser(actor);
    if (!advertiser) {
      throw new NotFoundError('Advertiser not found for the current user.');
    }
    authorizationPolicy.adCreative.assertCanUpdate(actor, advertiser.userId.toString());
    const existing = await adCreativeRepository.findById(creativeId);
    if (!existing) {
      throw new NotFoundError('Ad creative not found.');
    }

    const updated = await adCreativeRepository.updateById(creativeId, input);
    if (!updated) {
      throw new NotFoundError('Ad creative not found.');
    }
    return toAdCreative(updated);
  },
};
