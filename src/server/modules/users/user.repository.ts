import { connectToDatabase } from "@/server/db/mongoose";
import { UserModel, type UserDocument } from "@/server/modules/users/user.model";
import type { UserRecord } from "@/server/modules/users/user.types";

export const userRepository = {
  async findByEmail(email: string): Promise<UserDocument | null> {
    await connectToDatabase();
    return UserModel.findOne({ email: email.toLowerCase() }).lean<UserDocument>().exec();
  },

  async findByEmailWithPassword(
    email: string,
  ): Promise<UserDocument | null> {
    await connectToDatabase();
    return UserModel.findOne({ email: email.toLowerCase() })
      .select("+passwordHash")
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

  async updateById(
    userId: string,
    updateData: Partial<UserRecord>,
  ): Promise<UserDocument | null> {
    await connectToDatabase();
    return UserModel.findByIdAndUpdate(userId, updateData, { new: true })
      .lean<UserDocument>()
      .exec();
  },

  async deleteById(userId: string): Promise<UserDocument | null> {
    await connectToDatabase();
    return UserModel.findByIdAndDelete(userId).lean<UserDocument>().exec();
  }
};
