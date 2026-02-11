import { Request, Response } from "express";
import { z } from "zod";
import { CreateAppointmentSchema } from "../dtos/CreateAppointmentDTO";
import { AppointmentRepository } from "../repositories/AppointmentRepository";
import { PatientRepository } from "../repositories/PatientRepository";
import { CreateAppointmentService } from "../services/CreateAppointmentService";

export class CreateAppointmentController {
  async handle(req: Request, res: Response) {
    try {
      const data = CreateAppointmentSchema.parse(req.body);

      const appointmentRepository = new AppointmentRepository();
      const patientRepository = new PatientRepository();

      // Service Inject
      const createAppointmentService = new CreateAppointmentService(
        appointmentRepository,
        patientRepository,
      );

      const appointment = await createAppointmentService.execute(data);

      return res.status(201).json(appointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.issues });
      }

      const errorMessage =
        error instanceof Error ? error.message : "Internal error";
      return res.status(400).json({ error: errorMessage });
    }
  }
}
