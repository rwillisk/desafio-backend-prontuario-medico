import { Appointment, PrismaClient } from "@prisma/client";
import { CreateAppointmentInput } from "../dtos/CreateAppointmentDTO";

const prisma = new PrismaClient();

export class AppointmentRepository {
  // Validate if date is available to avoid double booking
  async findByDate(date: Date): Promise<Appointment | null> {
    const startOfHour = new Date(date);
    startOfHour.setMinutes(0, 0, 0);

    const endOfHour = new Date(startOfHour);
    endOfHour.setMinutes(59, 59, 999);

    return await prisma.appointment.findFirst({
      where: {
        date: {
          gte: startOfHour,
          lte: endOfHour,
        },
      },
    });
  }

  async create(data: CreateAppointmentInput): Promise<Appointment> {
    return await prisma.appointment.create({
      data: {
        date: data.date,
        notes: data.notes,
        patientId: data.patientId,
      },
    });
  }

  // List all
  async findAll(): Promise<Appointment[]> {
    return await prisma.appointment.findMany({
      include: { patient: true }, // Traz os dados do paciente junto (JOIN)
      orderBy: { date: "asc" },
    });
  }

  async findById(id: string): Promise<Appointment | null> {
    return await prisma.appointment.findUnique({
      where: { id },
      include: { patient: true },
    });
  }

  async findByPatientId(patientId: string): Promise<Appointment[]> {
    return await prisma.appointment.findMany({
      where: { patientId },
      orderBy: { date: "asc" },
    });
  }

  async update(
    id: string,
    data: Partial<CreateAppointmentInput>,
  ): Promise<Appointment> {
    return await prisma.appointment.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.appointment.delete({
      where: { id },
    });
  }
}
