import { model, models, Schema } from 'mongoose';
import {
  BOOKING_CREATIVE_TYPES,
  BOOKING_CURRENCIES,
  BOOKING_STATUSES,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
} from '@/shared/constants/booking';
import { MAX_CREATIVE_VIDEO_DURATION_SECONDS } from '@/shared/constants/creative';
import type { BookingRecord } from '@/server/modules/bookings/booking.types';

const bookingSchema = new Schema(
  {
    billboardId: { type: String, required: true, index: true },
    advertiserId: { type: String, required: true, index: true },
    campaignName: { type: String, required: true, trim: true },
    objective: { type: String, required: true },
    targetAudience: { type: String },
    brief: { type: String },
    notes: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    creativeUrl: { type: String },
    creativeType: { type: String, enum: Object.values(BOOKING_CREATIVE_TYPES) },
    creativeDurationSeconds: {
      type: Number,
      min: Number.EPSILON,
      validate: {
        validator: (value: number | undefined) =>
          value === undefined || value < MAX_CREATIVE_VIDEO_DURATION_SECONDS,
        message: `Video must be shorter than ${MAX_CREATIVE_VIDEO_DURATION_SECONDS} seconds.`,
      },
    },
    billing: {
      contactName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      vatNumber: { type: String },
    },
    company: {
      name: { type: String, required: true },
      commercialRegister: { type: String },
      address: { type: String, required: true },
      country: { type: String, required: true },
    },
    paymentMethod: { type: String, enum: Object.values(PAYMENT_METHODS), required: true },
    stripeCustomerId: { type: String },
    stripeSetupIntentId: { type: String },
    stripePaymentMethodId: { type: String },
    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUSES),
      required: true,
      default: PAYMENT_STATUSES.PENDING,
      index: true,
    },
    invoice: {
      currency: { type: String, enum: [...BOOKING_CURRENCIES], required: true, default: 'USD' },
      email: { type: String, required: true },
      poNumber: { type: String },
    },
    pricing: {
      days: { type: Number, required: true },
      dailyRate: { type: Number, required: true },
      subtotal: { type: Number, required: true },
      serviceFee: { type: Number, required: true },
      vat: { type: Number, required: true },
      total: { type: Number, required: true },
      currency: { type: String, required: true, default: 'USD' },
    },
    status: {
      type: String,
      enum: Object.values(BOOKING_STATUSES),
      required: true,
      default: BOOKING_STATUSES.PENDING,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'bookings',
  },
);

// Drives double-booking detection: overlapping windows per billboard.
bookingSchema.index({ billboardId: 1, startDate: 1, endDate: 1 });

export type BookingDocument = BookingRecord & {
  _id: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export const BookingModel = models.Booking || model('Booking', bookingSchema);
