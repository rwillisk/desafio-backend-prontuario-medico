import { Request, Response } from "express";
import { z } from "zod";
import { CreatePatientSchema } from "../dtos/CreatePatientDTO";
import { CreatePatientService } from "../services/CreatePatientService";

export class CreatePatientController {
  constructor(private readonly createPatientService: CreatePatientService) {}

  async handle(req: Request, res: Response) {
    try {
      const data = CreatePatientSchema.parse(req.body);

      const result = await this.createPatientService.execute(data);

      return res.status(201).json(result);
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
