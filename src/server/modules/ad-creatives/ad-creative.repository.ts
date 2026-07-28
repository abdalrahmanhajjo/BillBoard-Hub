import { connectToDatabase } from '@/server/db/mongoose';
import {
  AdCreativeModel,
  type AdCreativeDocument,
} from '@/server/modules/ad-creatives/ad-creative.model';
import type { AdCreativeRecord } from '@/server/modules/ad-creatives/ad-creative.types';

export const adCreativeRepository = {
  async create(data: AdCreativeRecord): Promise<AdCreativeDocument> {
    await connectToDatabase();
    const created = await AdCreativeModel.create(data);
    return created.toObject() as AdCreativeDocument;
  },
  async findByCampaignId(campaignId: string): Promise<AdCreativeDocument[]> {
    await connectToDatabase();
    return AdCreativeModel.find({ campaignId })
      .sort({ createdAt: -1 })
      .lean<AdCreativeDocument[]>()
      .exec();
  },
  async findById(creativeId: string): Promise<AdCreativeDocument | null> {
    await connectToDatabase();
    return AdCreativeModel.findById(creativeId).lean<AdCreativeDocument>().exec();
  },
  async deleteById(creativeId: string): Promise<AdCreativeDocument | null> {
    await connectToDatabase();
    return AdCreativeModel.findByIdAndDelete(creativeId).lean<AdCreativeDocument>().exec();
  },
  async findMany(filter: { createdBy?: string } = {}): Promise<AdCreativeDocument[]> {
    await connectToDatabase();
    return AdCreativeModel.find(filter).sort({ createdAt: -1 }).lean<AdCreativeDocument[]>().exec();
  },
};
