import { z } from 'zod';
import {
  EXPENSE_PAYMENT_METHODS,
  FINANCE_BASE_CURRENCY,
  FINANCE_CURRENCIES,
  OWNER_PAYMENT_STATUSES,
} from '@/shared/constants/finance';

const isoDate = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use a valid date (YYYY-MM-DD).')
  .refine((value) => !Number.isNaN(Date.parse(value)), 'Use a valid calendar date.');

const objectId = z
  .string()
  .trim()
  .regex(/^[a-f\d]{24}$/i, 'Provide a valid id.');

const money = z
  .number()
  .finite('Enter a valid amount.')
  .nonnegative('Amount cannot be negative.')
  .max(1_000_000_000, 'Amount is unrealistically large.')
  .multipleOf(0.01, 'Amount can have at most two decimal places.');

const ownerShape = {
  name: z
    .string()
    .trim()
    .min(2, 'Enter the owner name.')
    .max(160, 'Name must be 160 characters or fewer.'),
  companyName: z.string().trim().max(160, 'Company name is too long.').optional(),
  email: z.email('Enter a valid email address.').trim().toLowerCase().optional(),
  phone: z.string().trim().max(32, 'Phone number is too long.').optional(),
  address: z.string().trim().max(200, 'Address is too long.').optional(),
  contractReference: z.string().trim().max(80, 'Contract reference is too long.').optional(),
  contractStartDate: isoDate.optional(),
  contractEndDate: isoDate.optional(),
  monthlyPayment: money.default(0),
  currency: z.enum(FINANCE_CURRENCIES).default('USD'),
  notes: z.string().trim().max(2000, 'Notes must be 2000 characters or fewer.').optional(),
  isActive: z.boolean().default(true),
};

export const createOwnerSchema = z
  .object(ownerShape)
  .refine(
    (data) =>
      !data.contractStartDate ||
      !data.contractEndDate ||
      data.contractStartDate <= data.contractEndDate,
    { message: 'Contract end date must be on or after the start date.', path: ['contractEndDate'] },
  );

export const updateOwnerSchema = z
  .object(ownerShape)
  .partial()
  .refine(
    (data) => Object.values(data).some((value) => value !== undefined),
    'Change at least one field before saving.',
  )
  .refine(
    (data) =>
      !data.contractStartDate ||
      !data.contractEndDate ||
      data.contractStartDate <= data.contractEndDate,
    { message: 'Contract end date must be on or after the start date.', path: ['contractEndDate'] },
  );

export const createOwnerPaymentSchema = z
  .object({
    ownerId: objectId,
    billboardId: objectId.optional(),
    amount: money.refine((value) => value > 0, 'Amount must be greater than zero.'),
    currency: z.enum(FINANCE_CURRENCIES),
    exchangeRate: z
      .number()
      .finite('Enter a valid exchange rate.')
      .positive('Exchange rate must be greater than zero.')
      .optional(),
    dueDate: isoDate,
    paidDate: isoDate.optional(),
    status: z.enum(OWNER_PAYMENT_STATUSES).default(OWNER_PAYMENT_STATUSES.PENDING),
    paymentMethod: z.enum(EXPENSE_PAYMENT_METHODS).optional(),
    referenceNumber: z.string().trim().max(60, 'Reference is too long.').optional(),
    notes: z.string().trim().max(2000).optional(),
  })
  // Same rule as expenses: a foreign amount with no rate cannot be aggregated,
  // and refusing it here yields a 400 with guidance instead of a 500.
  .superRefine((data, context) => {
    if (data.currency !== FINANCE_BASE_CURRENCY && !data.exchangeRate) {
      context.addIssue({
        code: 'custom',
        message: `Enter the exchange rate to ${FINANCE_BASE_CURRENCY}.`,
        path: ['exchangeRate'],
      });
    }
  });

/**
 * Settling a payment is its own contract rather than a general update: marking
 * money as paid is the one transition an operator must not be able to make by
 * accident while editing an amount.
 */
export const settleOwnerPaymentSchema = z
  .object({
    status: z.enum(OWNER_PAYMENT_STATUSES),
    paidDate: isoDate.optional(),
    paymentMethod: z.enum(EXPENSE_PAYMENT_METHODS).optional(),
    referenceNumber: z.string().trim().max(60).optional(),
  })
  .refine((data) => data.status !== OWNER_PAYMENT_STATUSES.PAID || Boolean(data.paidDate), {
    message: 'Record the date the payment was made.',
    path: ['paidDate'],
  });

export type CreateOwnerSchemaInput = z.input<typeof createOwnerSchema>;
export type CreateOwnerSchemaOutput = z.output<typeof createOwnerSchema>;
export type UpdateOwnerSchemaInput = z.input<typeof updateOwnerSchema>;
export type UpdateOwnerSchemaOutput = z.output<typeof updateOwnerSchema>;
export type CreateOwnerPaymentSchemaInput = z.input<typeof createOwnerPaymentSchema>;
export type CreateOwnerPaymentSchemaOutput = z.output<typeof createOwnerPaymentSchema>;
export type SettleOwnerPaymentSchemaInput = z.input<typeof settleOwnerPaymentSchema>;
export type SettleOwnerPaymentSchemaOutput = z.output<typeof settleOwnerPaymentSchema>;
