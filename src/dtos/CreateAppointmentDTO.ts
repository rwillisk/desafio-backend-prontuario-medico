import { z } from "zod";

export const CreateAppointmentSchema = z.object({
  patientId: z.uuid("Invalid patient ID"),
  date: z.coerce.date().refine((date) => date > new Date(), {
    message: "The appointment date must be in the future",
  }),
  notes: z.string().optional(),
});

export type CreateAppointmentInput = z.infer<typeof CreateAppointmentSchema>;
