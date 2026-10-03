import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email("invalid email").optional(),
  phone: z.string().min(9, "Phone number must be at least 9 digits").regex(/^[0-9]+$/, "Phone number must contain only numbers").optional().nullable(),
  password: z.string().min(6, "Password must be atleast 6 characters "),
});

export const signUpSchema = z.object({
  email: z.string().email("Invalid email"),
  phone: z
    .string()
    .min(9, "Phone number must be at least 9 digits")
    .regex(/^[0-9]+$/, "Phone number must contain only numbers"),
  first_legal_name: z.string(),
  last_legal_name: z.string(),
  id_number: z
    .string()
    .min(8, "id number can not be less than 8")
    .regex(/^[0-9]+$/, "id number can only consist of numbers"),
  date_of_birth: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type signInFormValues = z.infer<typeof signInSchema>;
export type SignUpFormValues = z.infer<typeof signUpSchema>;
