import { connectToDatabase } from '@/server/db/mongoose';
import {
  PaymentEventModel,
  type PaymentEventDocument,
} from '@/server/modules/payments/payment-event.model';

export const paymentEventRepository = {
  async findByStripeEventId(stripeEventId: string): Promise<PaymentEventDocument | null> {
    await connectToDatabase();
    return PaymentEventModel.findOne({ stripeEventId }).lean<PaymentEventDocument>().exec();
  },

  async create(stripeEventId: string, type: string): Promise<PaymentEventDocument> {
    await connectToDatabase();
    const created = await PaymentEventModel.create({ stripeEventId, type });
    return created.toObject() as PaymentEventDocument;
  },
};
