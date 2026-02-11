import { Patient } from "@prisma/client";
import { CreatePatientInput } from "../dtos/CreatePatientDTO";
import { prisma } from "../utils/prisma";
import { IPatientRepository } from "./interfaces/IPatientRepository";

export class PatientRepository implements IPatientRepository {
  async findByEmail(email: string): Promise<Patient | null> {
    return await prisma.patient.findUnique({
      where: { email },
    });
  }

  async create(data: CreatePatientInput): Promise<Patient> {
    return await prisma.patient.create({
      data,
    });
  }

  // LIST ALL
  async findAll(): Promise<Patient[]> {
    return await prisma.patient.findMany({
      orderBy: { name: "asc" }, // Ordenado por nome (Sênior pensa na UX)
    });
  }

  // SEARCH BY ID
  async findById(id: string): Promise<Patient | null> {
    return await prisma.patient.findUnique({
      where: { id },
    });
  }

  // EDIT
  async update(
    id: string,
    data: Partial<CreatePatientInput>,
  ): Promise<Patient> {
    return await prisma.patient.update({
      where: { id },
      data,
    });
  }

  async anonymize(id: string): Promise<void> {
    await prisma.patient.update({
      where: { id },
      data: {
        name: null,
        email: null,
        phone: null,
        birthDate: null,
        gender: null,
        height: null,
        weight: null,
        isAnonymized: true,
      },
    });
  }
}
