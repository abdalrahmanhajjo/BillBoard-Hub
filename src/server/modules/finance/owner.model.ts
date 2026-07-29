import { model, models, Schema, type InferSchemaType } from 'mongoose';
import {
  EXPENSE_PAYMENT_METHODS,
  FINANCE_CURRENCIES,
  OWNER_PAYMENT_STATUSES,
} from '@/shared/constants/finance';
import type { OwnerPaymentRecord, OwnerRecord } from '@/server/modules/finance/finance.types';

const ownerSchema = new Schema<OwnerRecord>(
  {
    name: { type: String, required: true, trim: true, index: true },
    companyName: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    contractReference: { type: String, trim: true },
    contractStartDate: { type: Date },
    contractEndDate: { type: Date },
    monthlyPayment: { type: Number, required: true, min: 0, default: 0 },
    currency: { type: String, enum: FINANCE_CURRENCIES, required: true, default: 'USD' },
    notes: { type: String, trim: true },
    isActive: { type: Boolean, required: true, default: true, index: true },
    createdBy: { type: String, required: true, index: true },
  },
  { timestamps: true, collection: 'billboard_owners' },
);

export type OwnerDocument = InferSchemaType<typeof ownerSchema> & {
  _id: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export const OwnerModel = models.BillboardOwner || model('BillboardOwner', ownerSchema);

const ownerPaymentSchema = new Schema<OwnerPaymentRecord>(
  {
    ownerId: { type: String, required: true, index: true },
    billboardId: { type: String, index: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, enum: FINANCE_CURRENCIES, required: true },
    exchangeRate: { type: Number, required: true, min: 0 },
    baseAmount: { type: Number, required: true, min: 0 },
    dueDate: { type: Date, required: true, index: true },
    paidDate: { type: Date },
    status: {
      type: String,
      enum: Object.values(OWNER_PAYMENT_STATUSES),
      required: true,
      default: OWNER_PAYMENT_STATUSES.PENDING,
      index: true,
    },
    paymentMethod: { type: String, enum: Object.values(EXPENSE_PAYMENT_METHODS) },
    referenceNumber: { type: String, trim: true },
    notes: { type: String, trim: true },
    createdBy: { type: String, required: true },
  },
  { timestamps: true, collection: 'owner_payments' },
);

// "What do we owe this month" and "what is overdue" both scan status + dueDate.
ownerPaymentSchema.index({ status: 1, dueDate: 1 });

export type OwnerPaymentDocument = InferSchemaType<typeof ownerPaymentSchema> & {
  _id: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export const OwnerPaymentModel = models.OwnerPayment || model('OwnerPayment', ownerPaymentSchema);
