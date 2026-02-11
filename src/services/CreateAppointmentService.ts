import { CreateAppointmentInput } from "../dtos/CreateAppointmentDTO";
import { AppointmentRepository } from "../repositories/AppointmentRepository";
import { PatientRepository } from "../repositories/PatientRepository";

export class CreateAppointmentService {
  constructor(
    private readonly appointmentRepository: AppointmentRepository,
    private readonly patientRepository: PatientRepository,
  ) {}

  async execute(data: CreateAppointmentInput) {
    const patient = await this.patientRepository.findById(data.patientId);
    if (!patient) {
      throw new Error("Patient not found.");
    }

    const appointmentInSameDate = await this.appointmentRepository.findByDate(
      data.date,
    );

    if (appointmentInSameDate) {
      throw new Error("This time slot is already booked.");
    }

    const appointment = await this.appointmentRepository.create(data);
    return appointment;
  }
}
