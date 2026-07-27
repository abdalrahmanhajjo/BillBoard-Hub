import { z } from 'zod';
import { SCHEDULE_STATUSES } from '@/shared/constants/schedule';

const isoDateTime = z
  .string()
  .trim()
  .refine((value) => !Number.isNaN(Date.parse(value)), 'A valid date and time is required.');

export const createScheduleSchema = z
  .object({
    billboardId: z.string().trim().min(1, 'A digital billboard is required.'),
    playlistId: z.string().trim().min(1, 'A playlist is required.'),
    startAt: isoDateTime,
    endAt: isoDateTime,
    status: z.enum(SCHEDULE_STATUSES).default(SCHEDULE_STATUSES.SCHEDULED),
  })
  .refine((data) => Date.parse(data.endAt) > Date.parse(data.startAt), {
    message: 'The end time must be after the start time.',
    path: ['endAt'],
  });

export const updateScheduleSchema = z
  .object({
    playlistId: z.string().trim().min(1, 'A playlist is required.').optional(),
    startAt: isoDateTime.optional(),
    endAt: isoDateTime.optional(),
    status: z.enum(SCHEDULE_STATUSES).optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: 'At least one field must be provided.',
  })
  .refine(
    (data) =>
      data.startAt === undefined ||
      data.endAt === undefined ||
      Date.parse(data.endAt) > Date.parse(data.startAt),
    {
      message: 'The end time must be after the start time.',
      path: ['endAt'],
    },
  );

export type CreateScheduleSchemaInput = z.input<typeof createScheduleSchema>;
export type CreateScheduleSchemaOutput = z.output<typeof createScheduleSchema>;
export type UpdateScheduleSchemaInput = z.input<typeof updateScheduleSchema>;
export type UpdateScheduleSchemaOutput = z.output<typeof updateScheduleSchema>;
