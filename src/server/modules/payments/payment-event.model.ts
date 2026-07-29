import { model, models, Schema, type InferSchemaType } from 'mongoose';

/**
 * Ledger of processed Stripe webhook event ids, used to make webhook handling
 * idempotent (Stripe can deliver the same event more than once).
 */
const paymentEventSchema = new Schema(
  {
    stripeEventId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      index: true,
    },
    processedAt: {
      type: Date,
      required: true,
      default: () => new Date(),
    },
  },
  {
    timestamps: true,
    collection: 'payment_events',
  },
);

export type PaymentEventDocument = InferSchemaType<typeof paymentEventSchema> & {
  _id: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export const PaymentEventModel = models.PaymentEvent || model('PaymentEvent', paymentEventSchema);
