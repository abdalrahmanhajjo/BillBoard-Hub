import { connectToDatabase } from '@/server/db/mongoose';
import { PaymentModel, type PaymentDocument } from '@/server/modules/payments/payment.model';
import type { Payment } from '@/shared/types/payment';

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

  async create(data: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>) {
    await connectToDatabase();
    const created = await PaymentModel.create({
      ...data,
      bookingId: data.bookingId,
      advertiserId: data.advertiserId,
    });
    return created.toObject() as PaymentDocument;
  },

  async updateByBookingId(
    bookingId: string,
    updateData: Partial<Payment>,
  ): Promise<PaymentDocument | null> {
    await connectToDatabase();
    return PaymentModel.findOneAndUpdate({ bookingId }, updateData, { new: true })
      .lean<PaymentDocument>()
      .exec();
  },
};
