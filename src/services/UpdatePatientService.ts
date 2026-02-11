import { CreatePatientInput } from "../dtos/CreatePatientDTO";
import { IPatientRepository } from "../repositories/interfaces/IPatientRepository";

export class UpdatePatientService {
  constructor(private readonly patientRepository: IPatientRepository) {}

  async execute(id: string, data: Partial<CreatePatientInput>) {
    const patient = await this.patientRepository.findById(id);

    if (!patient) {
      throw new Error("Patient not found.");
    }

    return await this.patientRepository.update(id, data);
  }
}
