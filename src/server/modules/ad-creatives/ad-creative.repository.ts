import { connectToDatabase } from '@/server/db/mongoose';
import {
  AdCreativeModel,
  type AdCreativeDocument,
} from '@/server/modules/ad-creatives/ad-creative.model';
import {
  CreateAdCreativeSchemaInput,
  UpdateAdCreativeSchemaInput,
} from '@/shared/contracts/ad-creative/ad-creative.schema';

export const adCreativeRepository = {
  async create(data: CreateAdCreativeSchemaInput): Promise<AdCreativeDocument> {
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
  async findMany(filter?: { campaignIds?: string[] }): Promise<AdCreativeDocument[]> {
    await connectToDatabase();
    const query = filter?.campaignIds ? { campaignId: { $in: filter.campaignIds } } : {};
    return AdCreativeModel.find(query).sort({ createdAt: -1 }).lean<AdCreativeDocument[]>().exec();
  },
  async updateById(
    adCreativeId: string,
    data: UpdateAdCreativeSchemaInput,
  ): Promise<AdCreativeDocument | null> {
    await connectToDatabase();
    return AdCreativeModel.findByIdAndUpdate(adCreativeId, data, { new: true })
      .lean<AdCreativeDocument>()
      .exec();
  },
  async findByAdvertiser(advertiserId: string): Promise<AdCreativeDocument[]> {
    await connectToDatabase();
    return AdCreativeModel.find({ createdBy: advertiserId })
      .sort({ createdAt: -1 })
      .lean<AdCreativeDocument[]>()
      .exec();
  },
};
