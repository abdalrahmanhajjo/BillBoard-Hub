import { z } from 'zod';
import {
  BOOKING_CURRENCIES,
  BOOKING_STATUSES,
  CAMPAIGN_OBJECTIVES,
  PAYMENT_METHODS,
} from '@/shared/constants/booking';

const isoDate = z
  .string()
  .trim()
  .refine((value) => !Number.isNaN(Date.parse(value)), 'A valid date is required.');

const secureCreativeUrl = z
  .string()
  .trim()
  .max(2048, 'Creative link is too long.')
  .refine((value) => {
    try {
      return new URL(value).protocol === 'https:';
    } catch {
      return false;
    }
  }, 'The creative link must be a secure (https) URL.');

export const createBookingSchema = z
  .object({
    billboardId: z.string().trim().min(1, 'A billboard is required.'),
    campaignName: z
      .string()
      .trim()
      .min(2, 'Campaign name is required.')
      .max(120, 'Campaign name is too long.'),
    objective: z.enum(CAMPAIGN_OBJECTIVES),
    targetAudience: z.string().trim().max(500, 'Target audience is too long.').optional(),
    brief: z.string().trim().max(1000, 'Campaign brief is too long.').optional(),
    notes: z.string().trim().max(1000, 'Notes are too long.').optional(),
    startDate: isoDate,
    endDate: isoDate,
    creativeUrl: secureCreativeUrl.optional(),
    billing: z.object({
      contactName: z
        .string()
        .trim()
        .min(2, 'Billing contact name is required.')
        .max(120, 'Name is too long.'),
      email: z.email('A valid billing email is required.').trim().toLowerCase(),
      phone: z
        .string()
        .trim()
        .min(6, 'A valid phone number is required.')
        .max(30, 'Phone number is too long.')
        .regex(/^[+()\d][\d\s().-]{4,}$/, 'Enter a valid phone number (digits, +, spaces).'),
      vatNumber: z.string().trim().max(40, 'VAT number is too long.').optional(),
    }),
    company: z.object({
      name: z.string().trim().min(2, 'Company name is required.').max(160, 'Name is too long.'),
      commercialRegister: z.string().trim().max(60, 'Value is too long.').optional(),
      address: z
        .string()
        .trim()
        .min(2, 'Company address is required.')
        .max(200, 'Address is too long.'),
      country: z.string().trim().min(2, 'Country is required.').max(80, 'Country is too long.'),
    }),
    paymentMethod: z.enum(PAYMENT_METHODS),
    invoice: z.object({
      currency: z.enum(BOOKING_CURRENCIES).default('usd'),
      email: z.email('A valid invoice email is required.').trim().toLowerCase(),
      poNumber: z.string().trim().max(60, 'PO number is too long.').optional(),
    }),
    termsAccepted: z
      .boolean()
      .refine((value) => value === true, 'You must accept the terms to reserve.'),
  })
  .refine((data) => Date.parse(data.endDate) >= Date.parse(data.startDate), {
    message: 'The end date must be on or after the start date.',
    path: ['endDate'],
  });

export const updateBookingStatusSchema = z.object({
  status: z.enum([BOOKING_STATUSES.APPROVED, BOOKING_STATUSES.REJECTED]),
});

export type CreateBookingSchemaInput = z.input<typeof createBookingSchema>;
export type CreateBookingSchemaOutput = z.output<typeof createBookingSchema>;
export type UpdateBookingStatusSchemaInput = z.input<typeof updateBookingStatusSchema>;
