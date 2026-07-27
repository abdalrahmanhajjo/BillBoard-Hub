import { model, models, Schema, type InferSchemaType } from 'mongoose';
import { PAYMENT_STATUSES } from '@/shared/constants/payment';
import { CURRENCIES } from '@/shared/constants/currencies';
import type { PaymentMethod, PaymentStatus } from '@/shared/types/payment';
import type { Currency } from '@/shared/types/currency';

export interface PaymentRecord {
  bookingId: string;
  advertiserId: string;
  stripeSessionId: string;
  stripePaymentIntentId: string;
  amount: number;
  currency: Currency;
  status: PaymentStatus;
  paymentMethod?: PaymentMethod;
  paidAt?: Date;
}

interface PaymentMongoRecord extends Omit<PaymentRecord, 'bookingId' | 'advertiserId'> {
  bookingId: Schema.Types.ObjectId;
  advertiserId: Schema.Types.ObjectId;
}

const paymentSchema = new Schema<PaymentMongoRecord>(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      unique: true,
      index: true,
    },
    advertiserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    stripeSessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    stripePaymentIntentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      enum: Object.values(CURRENCIES).map((currency) => currency.code),
      default: CURRENCIES.USD.code,
    },
    status: {
      type: String,
      enum: Object.values(PAYMENT_STATUSES),
      default: PAYMENT_STATUSES.PENDING,
      index: true,
    },
    paymentMethod: {
      type: String,
      trim: true,
    },
    paidAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    collection: 'payments',
  },
);

paymentSchema.index({ bookingId: 1, status: 1 });
paymentSchema.index({ advertiserId: 1, createdAt: -1 });

export type PaymentDocument = InferSchemaType<typeof paymentSchema> & {
  _id: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export const PaymentModel = models.Payment || model<PaymentMongoRecord>('Payment', paymentSchema);
