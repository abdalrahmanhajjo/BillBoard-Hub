import { z } from 'zod';
import {
  BOOKING_CREATIVE_TYPES,
  BOOKING_CURRENCIES,
  BOOKING_STATUSES,
  CAMPAIGN_OBJECTIVES,
  PAYMENT_METHODS,
} from '@/shared/constants/booking';
import { MAX_CREATIVE_VIDEO_DURATION_SECONDS } from '@/shared/constants/creative';

const RESERVATION_PAYMENT_METHODS = [PAYMENT_METHODS.CARD, PAYMENT_METHODS.E_WALLET] as const;

const isoDate = z
  .string()
  .trim()
  .refine((value) => !Number.isNaN(Date.parse(value)), 'Choose a valid campaign date.');

const secureCreativeUrl = z
  .string()
  .trim()
  .max(2048, 'Creative URL must be 2,048 characters or fewer.')
  .refine((value) => {
    try {
      return new URL(value).protocol === 'https:';
    } catch {
      return false;
    }
  }, 'The creative link must be a secure (https) URL.');

export const createBookingSchema = z
  .object({
    billboardId: z.string().trim().min(1, 'Choose a billboard before reserving.'),
    campaignName: z
      .string()
      .trim()
      .min(2, 'Enter a campaign name.')
      .max(120, 'Campaign name must be 120 characters or fewer.'),
    objective: z.enum(CAMPAIGN_OBJECTIVES),
    targetAudience: z
      .string()
      .trim()
      .max(500, 'Target audience must be 500 characters or fewer.')
      .optional(),
    brief: z
      .string()
      .trim()
      .max(1000, 'Campaign brief must be 1,000 characters or fewer.')
      .optional(),
    notes: z.string().trim().max(1000, 'Notes must be 1,000 characters or fewer.').optional(),
    startDate: isoDate,
    endDate: isoDate,
    creativeUrl: secureCreativeUrl.optional(),
    creativeType: z.enum(BOOKING_CREATIVE_TYPES).optional(),
    creativeDurationSeconds: z
      .number()
      .positive('Video duration must be greater than 0.')
      .refine(
        (value) => value < MAX_CREATIVE_VIDEO_DURATION_SECONDS,
        `Video must be shorter than ${MAX_CREATIVE_VIDEO_DURATION_SECONDS} seconds.`,
      )
      .optional(),
    billing: z.object({
      contactName: z
        .string()
        .trim()
        .min(2, 'Enter the billing contact name.')
        .max(120, 'Billing contact name must be 120 characters or fewer.'),
      email: z.email('Enter a valid billing email address.').trim().toLowerCase(),
      phone: z
        .string()
        .trim()
        .min(6, 'Enter a valid phone number.')
        .max(30, 'Phone number must be 30 characters or fewer.')
        .regex(/^[+()\d][\d\s().-]{4,}$/, 'Enter a valid phone number (digits, +, spaces).'),
      vatNumber: z.string().trim().max(40, 'VAT number must be 40 characters or fewer.').optional(),
    }),
    company: z.object({
      name: z
        .string()
        .trim()
        .min(2, 'Enter the company name.')
        .max(160, 'Company name must be 160 characters or fewer.'),
      commercialRegister: z
        .string()
        .trim()
        .max(60, 'Commercial register must be 60 characters or fewer.')
        .optional(),
      address: z
        .string()
        .trim()
        .min(2, 'Enter the company address.')
        .max(200, 'Company address must be 200 characters or fewer.'),
      country: z
        .string()
        .trim()
        .min(2, 'Enter the country.')
        .max(80, 'Country must be 80 characters or fewer.'),
    }),
    paymentMethod: z.enum(RESERVATION_PAYMENT_METHODS, {
      error: 'Choose Visa through Stripe or Cash / Whish.',
    }),
    invoice: z.object({
      currency: z.enum(BOOKING_CURRENCIES).default('USD'),
      email: z.email('Enter a valid invoice email address.').trim().toLowerCase(),
      poNumber: z.string().trim().max(60, 'PO number must be 60 characters or fewer.').optional(),
    }),
    termsAccepted: z
      .boolean()
      .refine(
        (value) => value === true,
        'Accept the terms and advertising policies before submitting.',
      ),
  })
  .refine((data) => Date.parse(data.endDate) >= Date.parse(data.startDate), {
    message: 'The end date must be on or after the start date.',
    path: ['endDate'],
  })
  .superRefine((data, context) => {
    if (data.creativeUrl && !data.creativeType) {
      context.addIssue({
        code: 'custom',
        message: 'Creative file type is required.',
        path: ['creativeType'],
      });
    }
    if (data.creativeType && !data.creativeUrl) {
      context.addIssue({
        code: 'custom',
        message: 'Creative file URL is required.',
        path: ['creativeUrl'],
      });
    }
    if (
      data.creativeType === BOOKING_CREATIVE_TYPES.VIDEO &&
      data.creativeDurationSeconds === undefined
    ) {
      context.addIssue({
        code: 'custom',
        message: 'Video duration is required.',
        path: ['creativeDurationSeconds'],
      });
    }
    if (
      data.creativeType !== BOOKING_CREATIVE_TYPES.VIDEO &&
      data.creativeDurationSeconds !== undefined
    ) {
      context.addIssue({
        code: 'custom',
        message: 'Duration is only valid for video creatives.',
        path: ['creativeDurationSeconds'],
      });
    }
  });

export const updateBookingStatusSchema = z.object({
  status: z.enum([BOOKING_STATUSES.APPROVED, BOOKING_STATUSES.REJECTED]),
});

export type CreateBookingSchemaInput = z.input<typeof createBookingSchema>;
export type CreateBookingSchemaOutput = z.output<typeof createBookingSchema>;
export type UpdateBookingStatusSchemaInput = z.input<typeof updateBookingStatusSchema>;
