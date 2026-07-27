import { model, models, Schema, type InferSchemaType } from 'mongoose';
import { USER_ROLES } from '@/shared/constants/user-roles';
import { UserRecord } from './user.types';

const userSchema = new Schema<UserRecord>(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      required: true,
      default: USER_ROLES.ADVERTISER,
      index: true,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'users',
  },
);

export type UserDocument = InferSchemaType<typeof userSchema> & {
  _id: string;
};

export const UserModel = models.User || model('User', userSchema);
