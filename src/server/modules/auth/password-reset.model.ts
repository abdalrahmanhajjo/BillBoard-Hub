import { model, models, Schema, type InferSchemaType } from 'mongoose';
import type { PasswordResetTokenRecord } from '@/server/modules/auth/password-reset.types';

const passwordResetTokenSchema = new Schema<PasswordResetTokenRecord>(
  {
    userId: { type: String, required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    usedAt: { type: Date, default: null },
    requestedFrom: { type: String },
  },
  {
    timestamps: true,
    collection: 'password_reset_tokens',
  },
);

// Mongo sweeps documents a day after they expire so spent tokens do not
// accumulate. Eviction is periodic rather than immediate, so every lookup still
// checks `expiresAt` itself.
passwordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 });

export type PasswordResetTokenDocument = InferSchemaType<typeof passwordResetTokenSchema> & {
  _id: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export const PasswordResetTokenModel =
  models.PasswordResetToken || model('PasswordResetToken', passwordResetTokenSchema);
