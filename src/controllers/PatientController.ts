import { Request, Response } from "express";
import { z } from "zod";
import { UpdatePatientSchema } from "../dtos/CreatePatientDTO";
import { IPatientRepository } from "../repositories/interfaces/IPatientRepository";
import { AnonymizePatientService } from "../services/AnonymizePatientService";
import { UpdatePatientService } from "../services/UpdatePatientService";

export class PatientController {
  constructor(
    private readonly repository: IPatientRepository,
    private readonly updateService: UpdatePatientService,
    private readonly anonymizeService: AnonymizePatientService,
  ) {}

  // LIST
  async index(req: Request, res: Response) {
    const patients = await this.repository.findAll();
    return res.json(patients);
  }

  // EDIT
  async update(req: Request, res: Response) {
    const { id } = req.params;

    try {
      const data = UpdatePatientSchema.parse(req.body);
      // Ensure id is a string
      const patientId = String(id);
      const patient = await this.updateService.execute(patientId, data);
      return res.json(patient);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.issues });
      }
      const errorMessage =
        error instanceof Error ? error.message : "Internal error";
      return res.status(400).json({ error: errorMessage });
    }
  }

  // ANONYMIZE
  async delete(req: Request, res: Response) {
    const { id } = req.params;

    try {
      // Ensure id is a string
      const patientId = String(id);
      await this.anonymizeService.execute(patientId);
      return res.status(204).send();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Internal error";
      return res.status(400).json({ error: errorMessage });
    }
  }
}
