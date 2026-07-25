import { model, models, Schema } from 'mongoose';
import { BOOKING_CURRENCIES, BOOKING_STATUSES, PAYMENT_METHODS } from '@/shared/constants/booking';
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
