import { Patient } from "@prisma/client";
import { CreatePatientInput } from "../../dtos/CreatePatientDTO";

export interface IPatientRepository {
  findByEmail(email: string): Promise<Patient | null>;
  create(data: CreatePatientInput): Promise<Patient>;
  findAll(): Promise<Patient[]>;
  findById(id: string): Promise<Patient | null>;
  update(id: string, data: Partial<CreatePatientInput>): Promise<Patient>;
  anonymize(id: string): Promise<void>;
}
