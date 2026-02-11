import { Request, Response } from "express";
import { z } from "zod";
import { CreateAppointmentSchema } from "../dtos/CreateAppointmentDTO";
import { AppointmentRepository } from "../repositories/AppointmentRepository";


export class AppointmentController {
  async index(req: Request, res: Response): Promise<Response> {
    const repository = new AppointmentRepository();
    const appointments = await repository.findAll();
    return res.json(appointments);
  }

  async listByPatient(
    req: Request<{ id: string }>,
    res: Response,
  ): Promise<Response> {
    const { id: patientId } = req.params;

    const repository = new AppointmentRepository();
    const appointments = await repository.findByPatientId(patientId);

    return res.json(appointments);
  }

  async update(req: Request<{ id: string }>, res: Response): Promise<Response> {
    const { id } = req.params;
    const repository = new AppointmentRepository();

    try {
      const PartialAppointmentSchema = CreateAppointmentSchema.partial();
      // 'data' agora é tipado automaticamente com base no Zod
      const data = PartialAppointmentSchema.parse(req.body);

      const existing = await repository.findById(id);
      if (!existing) {
        return res.status(404).json({ error: "Appointment not found." });
      }

      const updated = await repository.update(id, data);
      return res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.issues });
      }
      const errorMessage =
        error instanceof Error ? error.message : "Internal error";
      return res.status(400).json({ error: errorMessage });
    }
  }

  async delete(req: Request<{ id: string }>, res: Response): Promise<Response> {
    const { id } = req.params;
    const repository = new AppointmentRepository();

    const existing = await repository.findById(id);
    if (!existing) {
      return res.status(404).json({ error: "Appointment not found." });
    }

    await repository.delete(id);
    return res.status(204).send();
  }
}
