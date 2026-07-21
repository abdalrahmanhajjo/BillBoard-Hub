import { z } from "zod";

import { createUserSchema } from "@/shared/contracts/user/user.schema";

export const registerSchema = createUserSchema
  .omit({
    role: true,
  });

export type RegisterSchemaInput = z.input<typeof registerSchema>;
