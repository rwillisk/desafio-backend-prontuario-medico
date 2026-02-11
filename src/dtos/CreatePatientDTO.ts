import { z } from "zod";

export const CreatePatientSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long"),
  email: z.email("Invalid email address").optional(),
  phone: z.string().min(10, "Invalid phone number"),
  birthDate: z.coerce.date(),
  gender: z.string(),
  height: z.number().positive(),
  weight: z.number().positive(),
});

export const UpdatePatientSchema = CreatePatientSchema.partial();

export type CreatePatientInput = z.infer<typeof CreatePatientSchema>;
export type UpdatePatientInput = z.infer<typeof UpdatePatientSchema>;
