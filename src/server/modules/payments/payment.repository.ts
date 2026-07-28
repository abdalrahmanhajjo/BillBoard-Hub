import { connectToDatabase } from '@/server/db/mongoose';
import { PaymentModel, type PaymentDocument } from '@/server/modules/payments/payment.model';
import type { PaymentRecord } from '@/server/modules/payments/payment.types';
import type { PaymentStatus } from '@/shared/types/payment';

export const paymentRepository = {
  async findByBookingId(bookingId: string): Promise<PaymentDocument | null> {
    await connectToDatabase();
    return PaymentModel.findOne({ bookingId }).lean<PaymentDocument>().exec();
  },

  async findByStripeSessionId(stripeSessionId: string): Promise<PaymentDocument | null> {
    await connectToDatabase();
    return PaymentModel.findOne({ stripeSessionId }).lean<PaymentDocument>().exec();
  },

  async findByStripePaymentIntentId(
    stripePaymentIntentId: string,
  ): Promise<PaymentDocument | null> {
    await connectToDatabase();
    return PaymentModel.findOne({ stripePaymentIntentId }).lean<PaymentDocument>().exec();
  },

  async create(data: PaymentRecord): Promise<PaymentDocument> {
    await connectToDatabase();
    const created = await PaymentModel.create(data);
    return created.toObject() as PaymentDocument;
  },

  async updateByBookingId(
    bookingId: string,
    updateData: Partial<PaymentRecord>,
  ): Promise<PaymentDocument | null> {
    await connectToDatabase();
    return PaymentModel.findOneAndUpdate({ bookingId }, updateData, { new: true })
      .lean<PaymentDocument>()
      .exec();
  },

  async updateByBookingIdWhenStatus(
    bookingId: string,
    allowedStatuses: PaymentStatus[],
    updateData: Partial<PaymentRecord>,
  ): Promise<PaymentDocument | null> {
    await connectToDatabase();
    return PaymentModel.findOneAndUpdate(
      { bookingId, status: { $in: allowedStatuses } },
      updateData,
      { new: true },
    )
      .lean<PaymentDocument>()
      .exec();
  },

  async upsertByBookingId(
    bookingId: string,
    data: Omit<PaymentRecord, 'bookingId'>,
  ): Promise<PaymentDocument> {
    await connectToDatabase();
    const payment = await PaymentModel.findOneAndUpdate(
      { bookingId },
      { $set: data, $setOnInsert: { bookingId } },
      { new: true, upsert: true, runValidators: true },
    )
      .lean<PaymentDocument>()
      .exec();

    return payment as PaymentDocument;
  },
};
