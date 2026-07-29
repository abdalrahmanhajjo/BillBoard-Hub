import { z } from 'zod';
import {
  EXPENSE_PAYMENT_METHODS,
  EXPENSE_RECURRENCES,
  EXPENSE_STATUSES,
  FINANCE_BASE_CURRENCY,
  FINANCE_CURRENCIES,
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

/**
 * Money is validated rather than trusted: a negative or non-finite amount would
 * silently invert a profit calculation, and `.multipleOf(0.01)` keeps values at
 * real currency precision instead of accumulating float dust across a report.
 */
const money = z
  .number()
  .finite('Enter a valid amount.')
  .positive('Amount must be greater than zero.')
  .max(1_000_000_000, 'Amount is unrealistically large.')
  .multipleOf(0.01, 'Amount can have at most two decimal places.');

const attachment = z.object({
  name: z.string().trim().min(1, 'Attachment name is required.').max(200),
  url: z.url('Attachment must be a valid URL.'),
});

const expenseShape = {
  title: z
    .string()
    .trim()
    .min(2, 'Give the expense a title.')
    .max(200, 'Title must be 200 characters or fewer.'),
  category: z
    .string()
    .trim()
    .min(2, 'Choose or name a category.')
    .max(60, 'Category must be 60 characters or fewer.'),
  amount: money,
  currency: z.enum(FINANCE_CURRENCIES),
  /**
   * Optional for the reporting currency, required otherwise: without a rate an
   * LBP cost cannot be added to USD revenue, and a report that silently sums
   * mixed currencies is worse than one that refuses the record.
   */
  exchangeRate: z
    .number()
    .finite('Enter a valid exchange rate.')
    .positive('Exchange rate must be greater than zero.')
    .optional(),
  recurrence: z.enum(EXPENSE_RECURRENCES).default(EXPENSE_RECURRENCES.ONE_OFF),
  status: z.enum(EXPENSE_STATUSES).default(EXPENSE_STATUSES.PENDING),
  paymentMethod: z.enum(EXPENSE_PAYMENT_METHODS).default(EXPENSE_PAYMENT_METHODS.BANK_TRANSFER),
  date: isoDate,
  billboardId: objectId.optional(),
  ownerId: objectId.optional(),
  vendorName: z.string().trim().max(160, 'Vendor name is too long.').optional(),
  referenceNumber: z.string().trim().max(60, 'Reference is too long.').optional(),
  notes: z.string().trim().max(2000, 'Notes must be 2000 characters or fewer.').optional(),
  attachments: z.array(attachment).max(10, 'Attach at most 10 files.').default([]),
};

/**
 * A foreign-currency cost without a rate is a user error, not a server fault,
 * so it is refused here with a field-level message rather than blowing up in
 * the conversion helper and surfacing as a 500.
 */
function requireRateForForeignCurrency(
  data: { currency?: string; exchangeRate?: number },
  context: z.RefinementCtx,
): void {
  if (data.currency && data.currency !== FINANCE_BASE_CURRENCY && !data.exchangeRate) {
    context.addIssue({
      code: 'custom',
      message: `Enter the exchange rate to ${FINANCE_BASE_CURRENCY} so this cost can be compared with revenue.`,
      path: ['exchangeRate'],
    });
  }
}

export const createExpenseSchema = z
  .object(expenseShape)
  .superRefine(requireRateForForeignCurrency);

export const updateExpenseSchema = z
  .object({
    ...expenseShape,
    recurrence: z.enum(EXPENSE_RECURRENCES).optional(),
    status: z.enum(EXPENSE_STATUSES).optional(),
    paymentMethod: z.enum(EXPENSE_PAYMENT_METHODS).optional(),
    attachments: z.array(attachment).max(10).optional(),
  })
  .partial()
  .refine(
    (data) => Object.values(data).some((value) => value !== undefined),
    'Change at least one field before saving.',
  )
  .superRefine(requireRateForForeignCurrency);

export const listExpensesSchema = z.object({
  billboardId: objectId.optional(),
  ownerId: objectId.optional(),
  category: z.string().trim().max(60).optional(),
  status: z.enum(EXPENSE_STATUSES).optional(),
  from: isoDate.optional(),
  to: isoDate.optional(),
});

export type CreateExpenseSchemaInput = z.input<typeof createExpenseSchema>;
export type CreateExpenseSchemaOutput = z.output<typeof createExpenseSchema>;
export type UpdateExpenseSchemaInput = z.input<typeof updateExpenseSchema>;
export type UpdateExpenseSchemaOutput = z.output<typeof updateExpenseSchema>;
export type ListExpensesSchemaInput = z.input<typeof listExpensesSchema>;
export type ListExpensesSchemaOutput = z.output<typeof listExpensesSchema>;
