import { model, models, Schema, type InferSchemaType } from 'mongoose';
import {
  EXPENSE_PAYMENT_METHODS,
  EXPENSE_RECURRENCES,
  EXPENSE_STATUSES,
  FINANCE_CURRENCIES,
} from '@/shared/constants/finance';
import type { ExpenseRecord } from '@/server/modules/finance/finance.types';

const attachmentSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const expenseSchema = new Schema<ExpenseRecord>(
  {
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true, index: true },
    categoryGroup: { type: String, required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, enum: FINANCE_CURRENCIES, required: true },
    exchangeRate: { type: Number, required: true, min: 0 },
    // Denormalised so every aggregation sums one comparable field instead of
    // re-applying FX per row (and drifting when a rate is later corrected).
    baseAmount: { type: Number, required: true, min: 0, index: true },
    recurrence: {
      type: String,
      enum: Object.values(EXPENSE_RECURRENCES),
      required: true,
      default: EXPENSE_RECURRENCES.ONE_OFF,
    },
    status: {
      type: String,
      enum: Object.values(EXPENSE_STATUSES),
      required: true,
      default: EXPENSE_STATUSES.PENDING,
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: Object.values(EXPENSE_PAYMENT_METHODS),
      required: true,
      default: EXPENSE_PAYMENT_METHODS.BANK_TRANSFER,
    },
    date: { type: Date, required: true, index: true },
    billboardId: { type: String, index: true },
    ownerId: { type: String, index: true },
    vendorName: { type: String, trim: true },
    referenceNumber: { type: String, trim: true },
    notes: { type: String, trim: true },
    attachments: { type: [attachmentSchema], default: [] },
    createdBy: { type: String, required: true, index: true },
  },
  {
    timestamps: true,
    collection: 'expenses',
  },
);

// Per-billboard profitability and the date-windowed reports are the two hot
// read paths; both filter on billboard and date together.
expenseSchema.index({ billboardId: 1, date: -1 });
expenseSchema.index({ date: -1, status: 1 });

export type ExpenseDocument = InferSchemaType<typeof expenseSchema> & {
  _id: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export const ExpenseModel = models.Expense || model('Expense', expenseSchema);
