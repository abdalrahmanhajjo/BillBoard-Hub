import { z } from 'zod';

export const issueDeviceKeySchema = z.object({
  billboardId: z.string().trim().min(1, 'Choose the screen this device runs on.'),
  name: z
    .string()
    .trim()
    .min(2, 'Give the device a recognisable name.')
    .max(120, 'Device name must be 120 characters or fewer.'),
});

export type IssueDeviceKeySchemaInput = z.input<typeof issueDeviceKeySchema>;
export type IssueDeviceKeySchemaOutput = z.output<typeof issueDeviceKeySchema>;
