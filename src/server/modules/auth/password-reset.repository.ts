import { connectToDatabase } from '@/server/db/mongoose';
import {
  PasswordResetTokenModel,
  type PasswordResetTokenDocument,
} from '@/server/modules/auth/password-reset.model';
import type { PasswordResetTokenRecord } from '@/server/modules/auth/password-reset.types';

export const passwordResetRepository = {
  async create(record: PasswordResetTokenRecord): Promise<PasswordResetTokenDocument> {
    await connectToDatabase();
    const created = await PasswordResetTokenModel.create(record);
    return created.toObject() as PasswordResetTokenDocument;
  },

  async findActiveByTokenHash(tokenHash: string): Promise<PasswordResetTokenDocument | null> {
    await connectToDatabase();
    return PasswordResetTokenModel.findOne({
      tokenHash,
      usedAt: null,
      expiresAt: { $gt: new Date() },
    })
      .lean<PasswordResetTokenDocument>()
      .exec();
  },

  /** Consumes every outstanding token for a user in one write. */
  async invalidateForUser(userId: string): Promise<void> {
    await connectToDatabase();
    await PasswordResetTokenModel.updateMany(
      { userId, usedAt: null },
      { $set: { usedAt: new Date() } },
    ).exec();
  },

  async countCreatedSince(userId: string, since: Date): Promise<number> {
    await connectToDatabase();
    return PasswordResetTokenModel.countDocuments({ userId, createdAt: { $gte: since } }).exec();
  },
};
