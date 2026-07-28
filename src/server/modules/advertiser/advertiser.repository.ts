import { connectToDatabase } from '@/server/db/mongoose';
import {
  AdvertiserModel,
  type AdvertiserDocument,
} from '@/server/modules/advertiser/advertiser.model';
import {
  CreateAdvertiserSchemaInput,
  UpdateAdvertiserSchemaInput,
} from '@/shared/contracts/advertiser/advertiser.schema';

export const advertiserRepository = {
  async create(
    data: CreateAdvertiserSchemaInput & { userId: string },
  ): Promise<AdvertiserDocument> {
    await connectToDatabase();
    const created = await AdvertiserModel.create(data);
    return created.toObject() as AdvertiserDocument;
  },
  async findById(advertiserId: string): Promise<AdvertiserDocument | null> {
    await connectToDatabase();
    return AdvertiserModel.findById(advertiserId).lean<AdvertiserDocument>().exec();
  },
  async deleteById(advertiserId: string): Promise<AdvertiserDocument | null> {
    await connectToDatabase();
    return AdvertiserModel.findByIdAndDelete(advertiserId).lean<AdvertiserDocument>().exec();
  },
  async findMany(): Promise<AdvertiserDocument[]> {
    await connectToDatabase();
    return AdvertiserModel.find().sort({ createdAt: -1 }).lean<AdvertiserDocument[]>().exec();
  },
  async updateById(
    advertiserId: string,
    data: UpdateAdvertiserSchemaInput,
  ): Promise<AdvertiserDocument | null> {
    await connectToDatabase();
    return AdvertiserModel.findByIdAndUpdate(advertiserId, data, { new: true })
      .lean<AdvertiserDocument>()
      .exec();
  },
};
