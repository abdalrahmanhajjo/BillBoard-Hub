import { z } from "zod";

import { USER_ROLES } from "@/shared/constants/user-roles";

export const registerSchema = z.object({
    firstName: z.string().trim().min(2, "First name is required."),
    lastName: z.string().trim().min(2, "Last name is required."),
    email: z.email("Please enter a valid email address.").trim().toLowerCase(),
    role: z.enum(USER_ROLES),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z
      .string()
      .min(8, "Confirm password must be at least 8 characters."),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });


export type RegisterSchemaInput = z.input<typeof registerSchema>;
