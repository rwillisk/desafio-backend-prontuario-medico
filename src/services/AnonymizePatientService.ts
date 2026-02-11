import { IPatientRepository } from "../repositories/interfaces/IPatientRepository";

export class AnonymizePatientService {
  constructor(private readonly patientRepository: IPatientRepository) {}

  async execute(id: string) {
    const patient = await this.patientRepository.findById(id);

    if (!patient) {
      throw new Error("Patient not found.");
    }

    if (patient.isAnonymized) {
      throw new Error("Patient is already anonymized.");
    }

    await this.patientRepository.anonymize(id);
  }
}
