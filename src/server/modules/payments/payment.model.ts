import { model, models, Schema, type InferSchemaType } from 'mongoose';
import { PAYMENT_METHODS, PAYMENT_PROVIDERS, PAYMENT_STATUSES } from '@/shared/constants/payment';
import { CURRENCIES } from '@/shared/constants/currencies';
import type { PaymentRecord } from '@/server/modules/payments/payment.types';

interface PaymentMongoRecord extends Omit<
  PaymentRecord,
  'bookingId' | 'advertiserId' | 'recordedBy'
> {
  bookingId: Schema.Types.ObjectId;
  advertiserId: Schema.Types.ObjectId;
  recordedBy?: Schema.Types.ObjectId;
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
    provider: {
      type: String,
      required: true,
      enum: Object.values(PAYMENT_PROVIDERS),
      index: true,
    },
    stripeSessionId: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
      index: true,
    },
    // Optional until Stripe attaches a PaymentIntent to the session. Sparse so
    // records without an intent yet are excluded from the unique index.
    stripePaymentIntentId: {
      type: String,
      unique: true,
      sparse: true,
    },
    stripeRefundId: {
      type: String,
      unique: true,
      sparse: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    amountPaid: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
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
      required: true,
      enum: Object.values(PAYMENT_METHODS),
      trim: true,
    },
    checkoutAttempt: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    refundAttempt: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    note: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    recordedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    expiresAt: {
      type: Date,
    },
    paidAt: {
      type: Date,
    },
    refundedAt: {
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
paymentSchema.index({ provider: 1, status: 1, updatedAt: -1 });

export type PaymentDocument = InferSchemaType<typeof paymentSchema> & {
  _id: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export const PaymentModel = models.Payment || model<PaymentMongoRecord>('Payment', paymentSchema);
