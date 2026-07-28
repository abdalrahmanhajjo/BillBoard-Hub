import { adCreativeRepository } from '@/server/modules/ad-creatives/ad-creative.repository';
import { toAdCreative } from '@/server/modules/ad-creatives/ad-creative.utils';
import { campaignRepository } from '@/server/modules/campaigns/campaign.repository';
import type { AdCreativeWithCampaign } from '@/shared/types/ad-creative';
import { campaignService } from '@/server/modules/campaigns/campaign.service';
import { authorizationPolicy } from '@/shared/policies';
import { NotFoundError } from '@/shared/http/http-error';
import type { CreateAdCreativeSchemaOutput } from '@/shared/contracts/ad-creative/ad-creative.schema';
import type { AdCreative } from '@/shared/types/ad-creative';
import type { User } from '@/shared/types/user';

export const adCreativeService = {
  async create(actor: User, input: CreateAdCreativeSchemaOutput): Promise<AdCreative> {
    const campaign = await campaignService.getById(actor, input.campaignId);
    authorizationPolicy.adCreative.assertCanCreate(actor, campaign);

    const created = await adCreativeRepository.create({
      campaignId: input.campaignId,
      url: input.url,
      fileType: input.fileType,
      durationSeconds: input.durationSeconds,
      createdBy: actor.id,
    });
    return toAdCreative(created);
  },

  async listByCampaign(actor: User, campaignId: string): Promise<AdCreative[]> {
    const campaign = await campaignService.getById(actor, campaignId);
    authorizationPolicy.adCreative.assertCanAccess(actor, campaign);
    const creatives = await adCreativeRepository.findByCampaignId(campaignId);
    return creatives.map(toAdCreative);
  },

  async listMine(actor: User): Promise<AdCreativeWithCampaign[]> {
    let filter: { createdBy?: string } = {};
    if (!authorizationPolicy.adCreative.canReadAny(actor)) {
      authorizationPolicy.adCreative.assertCanReadOwn(actor);
      filter = { createdBy: actor.id };
    }
    const creatives = await adCreativeRepository.findMany(filter);
    if (creatives.length === 0) return [];

    const campaignIds = Array.from(new Set(creatives.map((creative) => creative.campaignId)));
    const campaigns = await campaignRepository.findManyByIds(campaignIds);
    const campaignNameById = new Map(
      campaigns.map((campaign) => [String(campaign._id), campaign.name]),
    );

    return creatives.map((creative) => ({
      ...toAdCreative(creative),
      campaignName: campaignNameById.get(creative.campaignId) ?? 'Unknown campaign',
    }));
  },

  async delete(actor: User, creativeId: string): Promise<void> {
    const creative = await adCreativeRepository.findById(creativeId);
    if (!creative) {
      throw new NotFoundError('Ad creative not found.');
    }
    const campaign = await campaignService.getById(actor, String(creative.campaignId));
    authorizationPolicy.adCreative.assertCanDelete(actor, campaign);
    await adCreativeRepository.deleteById(creativeId);
  },
};
