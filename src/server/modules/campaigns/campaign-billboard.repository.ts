import { connectToDatabase } from '@/server/db/mongoose';
import {
  CampaignBillboardModel,
  type CampaignBillboardDocument,
} from '@/server/modules/campaigns/campaign-billboard.model';

export const campaignBillboardRepository = {
  async assignMany(
    campaignId: string,
    billboardIds: string[],
  ): Promise<CampaignBillboardDocument[]> {
    await connectToDatabase();
    const operations = billboardIds.map((billboardId) => ({
      updateOne: {
        filter: { campaignId, billboardId },
        update: { $setOnInsert: { campaignId, billboardId } },
        upsert: true,
      },
    }));
    await CampaignBillboardModel.bulkWrite(operations);
    return CampaignBillboardModel.find({ campaignId }).lean<CampaignBillboardDocument[]>().exec();
  },
  async findByCampaignId(campaignId: string): Promise<CampaignBillboardDocument[]> {
    await connectToDatabase();
    return CampaignBillboardModel.find({ campaignId }).lean<CampaignBillboardDocument[]>().exec();
  },
};
