import { CreatePatientInput } from "../dtos/CreatePatientDTO";
import { IPatientRepository } from "../repositories/interfaces/IPatientRepository";

export class CreatePatientService {
  constructor(private readonly patientRepository: IPatientRepository) {}

  async execute(data: CreatePatientInput) {
    if (data.email) {
      const patientAlreadyExists = await this.patientRepository.findByEmail(
        data.email,
      );

      if (patientAlreadyExists) {
        throw new Error("Patient already exists with this email.");
      }
    }

    const patient = await this.patientRepository.create(data);
    return patient;
  }
}
