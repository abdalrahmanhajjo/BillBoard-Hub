import { connectToDatabase } from '@/server/db/mongoose';
import {
  ImpressionModel,
  type ImpressionDocument,
} from '@/server/modules/impressions/impression.model';
import type { ImpressionRecord } from '@/server/modules/impressions/impression.types';

export type ImpressionFilter = {
  billboardId?: string;
  creativeId?: string;
  playlistId?: string;
  advertiserId?: string;
};

function buildMatch(filter: ImpressionFilter): Record<string, unknown> {
  const match: Record<string, unknown> = {};
  if (filter.billboardId) match.billboardId = filter.billboardId;
  if (filter.creativeId) match.creativeId = filter.creativeId;
  if (filter.playlistId) match.playlistId = filter.playlistId;
  if (filter.advertiserId) match.advertiserId = filter.advertiserId;
  return match;
}

export const impressionRepository = {
  async create(record: ImpressionRecord): Promise<ImpressionDocument> {
    await connectToDatabase();
    const created = await ImpressionModel.create(record);
    return created.toObject() as ImpressionDocument;
  },

  async countTotal(filter: ImpressionFilter = {}): Promise<number> {
    await connectToDatabase();
    return ImpressionModel.countDocuments(buildMatch(filter)).exec();
  },

  async findRecent(filter: ImpressionFilter = {}, limit = 20): Promise<ImpressionDocument[]> {
    await connectToDatabase();
    return ImpressionModel.find(buildMatch(filter))
      .sort({ occurredAt: -1 })
      .limit(limit)
      .lean<ImpressionDocument[]>()
      .exec();
  },

  async aggregateByCreative(
    filter: ImpressionFilter = {},
  ): Promise<Array<{ creativeId: string; count: number }>> {
    await connectToDatabase();
    const rows = await ImpressionModel.aggregate<{ _id: string; count: number }>([
      { $match: buildMatch(filter) },
      { $group: { _id: '$creativeId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    return rows.map((row) => ({ creativeId: String(row._id), count: row.count }));
  },
};
