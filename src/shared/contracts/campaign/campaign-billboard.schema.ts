import { z } from 'zod';

export const assignBillboardsSchema = z.object({
  billboardIds: z.array(z.string().min(1)).min(1, 'At least one billboard is required.'),
});

export type AssignBillboardsSchemaInput = z.input<typeof assignBillboardsSchema>;
export type AssignBillboardsSchemaOutput = z.output<typeof assignBillboardsSchema>;
