import { z } from 'zod';

export const createCheckoutSessionSchema = z.object({
  bookingId: z.string().min(1, 'Booking id is required.'),
});

export const getPaymentByBookingSchema = z.object({
  bookingId: z.string().min(1, 'Booking id is required.'),
});

export const stripeWebhookEventIdSchema = z.object({
  eventId: z.string().min(1, 'Stripe event id is required.'),
});

export type CreateCheckoutSessionSchemaInput = z.input<typeof createCheckoutSessionSchema>;
export type CreateCheckoutSessionSchemaOutput = z.output<typeof createCheckoutSessionSchema>;
export type GetPaymentByBookingSchemaInput = z.input<typeof getPaymentByBookingSchema>;
export type StripeWebhookEventIdSchemaInput = z.input<typeof stripeWebhookEventIdSchema>;
