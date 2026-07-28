import { z } from 'zod';
import { PAYMENT_STATUSES } from '@/shared/constants/booking';

export const createCheckoutSessionSchema = z.object({
  bookingId: z.string().trim().min(1, 'Choose a reservation before starting payment.'),
});

export const getPaymentByBookingSchema = z.object({
  bookingId: z.string().trim().min(1, 'Choose a reservation before loading payment details.'),
});

export const verifyCheckoutSessionSchema = z.object({
  sessionId: z.string().trim().min(1, 'The Stripe Checkout session is missing.'),
});

export const recordManualPaymentSchema = z
  .object({
    bookingId: z.string().trim().min(1, 'Choose a reservation before recording payment.'),
    status: z.enum([
      PAYMENT_STATUSES.PAID,
      PAYMENT_STATUSES.PARTIALLY_PAID,
      PAYMENT_STATUSES.UNPAID,
      PAYMENT_STATUSES.REFUNDED,
    ]),
    amountPaid: z.number().finite().min(0, 'The recorded amount cannot be negative.').optional(),
    note: z.string().trim().max(500, 'Keep the payment note under 500 characters.').optional(),
  })
  .superRefine((value, context) => {
    if (
      value.status === PAYMENT_STATUSES.PARTIALLY_PAID &&
      (!value.amountPaid || value.amountPaid <= 0)
    ) {
      context.addIssue({
        code: 'custom',
        path: ['amountPaid'],
        message: 'Enter the amount received for a partial payment.',
      });
    }
  });

export const refundPaymentSchema = z.object({
  bookingId: z.string().trim().min(1, 'Choose a reservation before issuing a refund.'),
  reason: z.enum(['duplicate', 'fraudulent', 'requested_by_customer']).optional(),
});

export const stripeWebhookEventIdSchema = z.object({
  eventId: z.string().min(1, 'Stripe event id is required.'),
});

export type CreateCheckoutSessionSchemaInput = z.input<typeof createCheckoutSessionSchema>;
export type CreateCheckoutSessionSchemaOutput = z.output<typeof createCheckoutSessionSchema>;
export type GetPaymentByBookingSchemaInput = z.input<typeof getPaymentByBookingSchema>;
export type VerifyCheckoutSessionSchemaInput = z.input<typeof verifyCheckoutSessionSchema>;
export type RecordManualPaymentSchemaInput = z.input<typeof recordManualPaymentSchema>;
export type RecordManualPaymentSchemaOutput = z.output<typeof recordManualPaymentSchema>;
export type RefundPaymentSchemaInput = z.input<typeof refundPaymentSchema>;
export type StripeWebhookEventIdSchemaInput = z.input<typeof stripeWebhookEventIdSchema>;
