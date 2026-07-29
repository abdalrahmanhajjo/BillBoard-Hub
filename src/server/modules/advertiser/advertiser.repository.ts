import { connectToDatabase } from '@/server/db/mongoose';
import {
  AdvertiserModel,
  type AdvertiserDocument,
} from '@/server/modules/advertiser/advertiser.model';
import type { AdvertiserRecord } from '@/server/modules/advertiser/advertiser.types';

export const advertiserRepository = {
  async create(record: AdvertiserRecord): Promise<AdvertiserDocument> {
    await connectToDatabase();
    const created = await AdvertiserModel.create(record);
    return created.toObject() as AdvertiserDocument;
  },

  async findByUserId(userId: string): Promise<AdvertiserDocument | null> {
    await connectToDatabase();
    return AdvertiserModel.findOne({ userId }).lean<AdvertiserDocument>().exec();
  },

  /** Profiles for a set of accounts, for joins such as the admin directory. */
  async findManyByUserIds(userIds: string[]): Promise<AdvertiserDocument[]> {
    await connectToDatabase();
    return AdvertiserModel.find({ userId: { $in: userIds } })
      .lean<AdvertiserDocument[]>()
      .exec();
  },

  async updateByUserId(
    userId: string,
    updateData: Partial<AdvertiserRecord>,
  ): Promise<AdvertiserDocument | null> {
    await connectToDatabase();
    return AdvertiserModel.findOneAndUpdate({ userId }, updateData, { new: true })
      .lean<AdvertiserDocument>()
      .exec();
  },

  async deleteByUserId(userId: string): Promise<AdvertiserDocument | null> {
    await connectToDatabase();
    return AdvertiserModel.findOneAndDelete({ userId }).lean<AdvertiserDocument>().exec();
  },
};
