import { connectToDatabase } from '@/server/db/mongoose';
import { DeviceModel, type DeviceDocument } from '@/server/modules/devices/device.model';
import type { DeviceRecord } from '@/server/modules/devices/device.types';

export const deviceRepository = {
  async create(record: DeviceRecord): Promise<DeviceDocument> {
    await connectToDatabase();
    const created = await DeviceModel.create(record);
    return created.toObject() as DeviceDocument;
  },

  async findActiveByKeyHash(keyHash: string): Promise<DeviceDocument | null> {
    await connectToDatabase();
    return DeviceModel.findOne({ keyHash, isActive: true }).lean<DeviceDocument>().exec();
  },

  async findByBillboardId(billboardId: string): Promise<DeviceDocument[]> {
    await connectToDatabase();
    return DeviceModel.find({ billboardId }).lean<DeviceDocument[]>().exec();
  },

  /** Fire-and-forget heartbeat; never blocks the request that triggered it. */
  async touchLastSeen(deviceId: string): Promise<void> {
    await connectToDatabase();
    await DeviceModel.updateOne({ _id: deviceId }, { $set: { lastSeenAt: new Date() } }).exec();
  },

  async revoke(deviceId: string): Promise<DeviceDocument | null> {
    await connectToDatabase();
    return DeviceModel.findByIdAndUpdate(deviceId, { isActive: false }, { new: true })
      .lean<DeviceDocument>()
      .exec();
  },
};
