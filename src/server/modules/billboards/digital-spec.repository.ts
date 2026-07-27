import { connectToDatabase } from '@/server/db/mongoose';
import {
  DigitalSpecModel,
  type DigitalSpecDocument,
} from '@/server/modules/billboards/digital-spec.model';
import type { UpsertDigitalSpecSchemaOutput } from '@/shared/contracts/billboard/digital-spec.schema';

export const digitalSpecRepository = {
  async findByBillboardId(billboardId: string): Promise<DigitalSpecDocument | null> {
    await connectToDatabase();
    return DigitalSpecModel.findOne({ billboardId }).lean<DigitalSpecDocument>().exec();
  },

  async upsertByBillboardId(
    billboardId: string,
    data: UpsertDigitalSpecSchemaOutput,
  ): Promise<DigitalSpecDocument> {
    await connectToDatabase();
    const saved = await DigitalSpecModel.findOneAndUpdate(
      { billboardId },
      { $set: { ...data, billboardId } },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    )
      .lean<DigitalSpecDocument>()
      .exec();

    return saved as DigitalSpecDocument;
  },

  async deleteByBillboardId(billboardId: string): Promise<void> {
    await connectToDatabase();
    await DigitalSpecModel.deleteOne({ billboardId }).exec();
  },
};
