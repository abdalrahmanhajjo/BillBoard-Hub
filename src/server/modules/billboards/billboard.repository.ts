import { connectToDatabase } from '@/server/db/mongoose';
import {
  BillboardModel,
  type BillboardDocument,
} from '@/server/modules/billboards/billboard.model';
import type { BillboardRecord } from '@/server/modules/billboards/billboard.types';
import type { BillboardStatus } from '@/shared/types/billboard';

export const billboardRepository = {
  async create(data: BillboardRecord): Promise<BillboardDocument> {
    await connectToDatabase();
    const created = await BillboardModel.create(data);

    return created.toObject() as BillboardDocument;
  },

  async findByCode(code: string): Promise<BillboardDocument | null> {
    await connectToDatabase();
    return BillboardModel.findOne({ code }).lean<BillboardDocument>().exec();
  },

  async findById(billboardId: string): Promise<BillboardDocument | null> {
    await connectToDatabase();
    return BillboardModel.findById(billboardId).lean<BillboardDocument>().exec();
  },

  async updateStatus(
    billboardId: string,
    status: BillboardStatus,
  ): Promise<BillboardDocument | null> {
    await connectToDatabase();
    return BillboardModel.findByIdAndUpdate(billboardId, { status }, { new: true })
      .lean<BillboardDocument>()
      .exec();
  },

  async updateById(
    billboardId: string,
    data: Partial<BillboardRecord>,
  ): Promise<BillboardDocument | null> {
    await connectToDatabase();
    return BillboardModel.findByIdAndUpdate(billboardId, data, { new: true })
      .lean<BillboardDocument>()
      .exec();
  },

  async findMany(): Promise<BillboardDocument[]> {
    await connectToDatabase();
    return BillboardModel.find().sort({ createdAt: -1 }).lean<BillboardDocument[]>().exec();
  },

  async deleteById(billboardId: string): Promise<BillboardDocument | null> {
    await connectToDatabase();
    return BillboardModel.findByIdAndDelete(billboardId).lean<BillboardDocument>().exec();
  },
};
