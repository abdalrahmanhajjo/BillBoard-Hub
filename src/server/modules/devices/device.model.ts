import { model, models, Schema, type InferSchemaType } from 'mongoose';
import type { DeviceRecord } from '@/server/modules/devices/device.types';

const deviceSchema = new Schema<DeviceRecord>(
  {
    billboardId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    // Unique so the same key can never be issued to two screens.
    keyHash: { type: String, required: true, unique: true },
    isActive: { type: Boolean, required: true, default: true, index: true },
    lastSeenAt: { type: Date, default: null },
    createdBy: { type: String, required: true },
  },
  {
    timestamps: true,
    collection: 'devices',
  },
);

export type DeviceDocument = InferSchemaType<typeof deviceSchema> & {
  _id: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export const DeviceModel = models.Device || model('Device', deviceSchema);
