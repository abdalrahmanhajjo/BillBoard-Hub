import { connectToDatabase } from '@/server/db/mongoose';
import { UserModel, type UserDocument } from '@/server/modules/users/user.model';
import type { UserRecord } from '@/server/modules/users/user.types';
import type { UserRole } from '@/shared/types/user';

/**
 * Upper bound on a single directory read. The admin advertiser list is filtered
 * in the browser, so the response has to stay a size a page can hold.
 */
export const USER_LIST_LIMIT = 500;

export const userRepository = {
  async findByEmail(email: string): Promise<UserDocument | null> {
    await connectToDatabase();
    return UserModel.findOne({ email: email.toLowerCase() }).lean<UserDocument>().exec();
  },

  async findByEmailWithPassword(email: string): Promise<UserDocument | null> {
    await connectToDatabase();
    return UserModel.findOne({ email: email.toLowerCase() })
      .select('+passwordHash')
      .lean<UserDocument>()
      .exec();
  },

  async create(data: UserRecord): Promise<UserDocument> {
    await connectToDatabase();
    const created = await UserModel.create({
      ...data,
      email: data.email.toLowerCase(),
      isActive: data.isActive ?? true,
    });

    return created.toObject() as UserDocument;
  },

  async findById(userId: string): Promise<UserDocument | null> {
    await connectToDatabase();
    return UserModel.findById(userId).lean<UserDocument>().exec();
  },

  async findManyByRole(role: UserRole, limit = USER_LIST_LIMIT): Promise<UserDocument[]> {
    await connectToDatabase();
    return UserModel.find({ role })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean<UserDocument[]>()
      .exec();
  },

  async findMany(limit = USER_LIST_LIMIT): Promise<UserDocument[]> {
    await connectToDatabase();
    return UserModel.find().sort({ createdAt: -1 }).limit(limit).lean<UserDocument[]>().exec();
  },

  /**
   * Active accounts holding a role, excluding one id. Backs the guard that
   * stops the last active admin from being demoted or deactivated — the
   * exclusion is the account being changed, so the count answers "who would be
   * left afterwards".
   */
  async countActiveByRoleExcluding(role: UserRole, excludedUserId: string): Promise<number> {
    await connectToDatabase();
    return UserModel.countDocuments({
      role,
      isActive: true,
      _id: { $ne: excludedUserId },
    }).exec();
  },

  async findByIdWithPassword(userId: string): Promise<UserDocument | null> {
    await connectToDatabase();
    return UserModel.findById(userId).select('+passwordHash').lean<UserDocument>().exec();
  },

  async updateById(userId: string, updateData: Partial<UserRecord>): Promise<UserDocument | null> {
    await connectToDatabase();
    return UserModel.findByIdAndUpdate(userId, updateData, { new: true })
      .lean<UserDocument>()
      .exec();
  },

  async deleteById(userId: string): Promise<UserDocument | null> {
    await connectToDatabase();
    return UserModel.findByIdAndDelete(userId).lean<UserDocument>().exec();
  },
};
