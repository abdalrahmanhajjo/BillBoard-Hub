import { connectToDatabase } from '@/server/db/mongoose';
import { CampaignModel, type CampaignDocument } from '@/server/modules/campaigns/campaign.model';
import type { CampaignRecord } from '@/server/modules/campaigns/campaign.types';
import type { CampaignStatus } from '@/shared/types/campaign';

export const campaignRepository = {
  async create(data: CampaignRecord): Promise<CampaignDocument> {
    await connectToDatabase();
    const created = await CampaignModel.create(data);
    return created.toObject() as CampaignDocument;
  },
  async findById(campaignId: string): Promise<CampaignDocument | null> {
    await connectToDatabase();
    return CampaignModel.findById(campaignId).lean<CampaignDocument>().exec();
  },
  async findMany(filter: { createdBy?: string } = {}): Promise<CampaignDocument[]> {
    await connectToDatabase();
    return CampaignModel.find(filter).sort({ createdAt: -1 }).lean<CampaignDocument[]>().exec();
  },
  async updateById(
    campaignId: string,
    data: Partial<CampaignRecord>,
  ): Promise<CampaignDocument | null> {
    await connectToDatabase();
    return CampaignModel.findByIdAndUpdate(campaignId, data, { new: true })
      .lean<CampaignDocument>()
      .exec();
  },
  async updateStatus(campaignId: string, status: CampaignStatus): Promise<CampaignDocument | null> {
    await connectToDatabase();
    return CampaignModel.findByIdAndUpdate(campaignId, { status }, { new: true })
      .lean<CampaignDocument>()
      .exec();
  },
  async findManyByIds(campaignIds: string[]): Promise<CampaignDocument[]> {
    await connectToDatabase();
    return CampaignModel.find({ _id: { $in: campaignIds } })
      .lean<CampaignDocument[]>()
      .exec();
  },
};
