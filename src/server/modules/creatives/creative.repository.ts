import { connectToDatabase } from '@/server/db/mongoose';
import { CreativeModel, type CreativeDocument } from '@/server/modules/creatives/creative.model';
import type { CreativeRecord } from '@/server/modules/creatives/creative.types';
import type { UpdateCreativeSchemaOutput } from '@/shared/contracts/creative/creative.schema';
import type { CreativeStatus } from '@/shared/types/creative';

export const creativeRepository = {
  async create(data: CreativeRecord): Promise<CreativeDocument> {
    await connectToDatabase();
    const created = await CreativeModel.create(data);
    return created.toObject() as CreativeDocument;
  },

  async findById(creativeId: string): Promise<CreativeDocument | null> {
    await connectToDatabase();
    return CreativeModel.findById(creativeId).lean<CreativeDocument>().exec();
  },

  async findMany(): Promise<CreativeDocument[]> {
    await connectToDatabase();
    return CreativeModel.find().sort({ createdAt: -1 }).lean<CreativeDocument[]>().exec();
  },

  async findByAdvertiser(advertiserId: string): Promise<CreativeDocument[]> {
    await connectToDatabase();
    return CreativeModel.find({ advertiserId })
      .sort({ createdAt: -1 })
      .lean<CreativeDocument[]>()
      .exec();
  },

  async findByIds(creativeIds: string[]): Promise<CreativeDocument[]> {
    await connectToDatabase();
    return CreativeModel.find({ _id: { $in: creativeIds } })
      .lean<CreativeDocument[]>()
      .exec();
  },

  async updateById(
    creativeId: string,
    data: UpdateCreativeSchemaOutput,
  ): Promise<CreativeDocument | null> {
    await connectToDatabase();
    return CreativeModel.findByIdAndUpdate(creativeId, data, { new: true })
      .lean<CreativeDocument>()
      .exec();
  },

  async updateStatus(creativeId: string, status: CreativeStatus): Promise<CreativeDocument | null> {
    await connectToDatabase();
    return CreativeModel.findByIdAndUpdate(creativeId, { status }, { new: true })
      .lean<CreativeDocument>()
      .exec();
  },

  async deleteById(creativeId: string): Promise<CreativeDocument | null> {
    await connectToDatabase();
    return CreativeModel.findByIdAndDelete(creativeId).lean<CreativeDocument>().exec();
  },
};
