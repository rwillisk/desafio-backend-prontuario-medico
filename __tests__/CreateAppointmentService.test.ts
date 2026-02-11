import { CreateAppointmentInput } from "../src/dtos/CreateAppointmentDTO";
import { AppointmentRepository } from "../src/repositories/AppointmentRepository";
import { PatientRepository } from "../src/repositories/PatientRepository";
import { CreateAppointmentService } from "../src/services/CreateAppointmentService";

class InMemoryAppointmentRepository implements Partial<AppointmentRepository> {
  private appointments: any[] = [];

  async findByDate(date: Date) {
    const startOfHour = new Date(date);
    startOfHour.setMinutes(0, 0, 0);

    const endOfHour = new Date(startOfHour);
    endOfHour.setMinutes(59, 59, 999);

    return (
      this.appointments.find(
        (a) => a.date >= startOfHour && a.date <= endOfHour,
      ) ?? null
    );
  }

  async create(data: CreateAppointmentInput) {
    const appointment = {
      id: (this.appointments.length + 1).toString(),
      ...data,
    };
    this.appointments.push(appointment);
    return appointment as any;
  }

  async findAll() {
    return [...this.appointments].sort(
      (a, b) => a.date.getTime() - b.date.getTime(),
    );
  }

  async findByPatientId(patientId: string) {
    return this.appointments.filter((a) => a.patientId === patientId);
  }

  async update(id: string, data: Partial<CreateAppointmentInput>) {
    const index = this.appointments.findIndex((a) => a.id === id);
    if (index === -1) {
      throw new Error("Appointment not found.");
    }
    this.appointments[index] = { ...this.appointments[index], ...data };
    return this.appointments[index] as any;
  }

  async delete(id: string) {
    const index = this.appointments.findIndex((a) => a.id === id);
    if (index === -1) {
      throw new Error("Appointment not found.");
    }
    this.appointments.splice(index, 1);
  }
}

class InMemoryPatientRepository implements Partial<PatientRepository> {
  private patients: any[] = [{ id: "patient-1" }];

  async findById(id: string) {
    return this.patients.find((p) => p.id === id) ?? null;
  }

  async create(data: any) {
    const patient = { id: "patient-2", ...data };
    this.patients.push(patient);
    return patient;
  }
}

describe("CreateAppointmentService", () => {
  it("should throw error if patient does not exist", async () => {
    const appointmentRepo =
      new InMemoryAppointmentRepository() as unknown as AppointmentRepository;
    const patientRepo =
      new InMemoryPatientRepository() as unknown as PatientRepository;
    const service = new CreateAppointmentService(appointmentRepo, patientRepo);

    const input: CreateAppointmentInput = {
      patientId: "patient-unknown",
      date: new Date(Date.now() + 60 * 60 * 1000),
      notes: "Test appointment",
    };

    await expect(service.execute(input)).rejects.toThrow("Patient not found.");
  });

  it("should create a valid appointment", async () => {
    const appointmentRepo =
      new InMemoryAppointmentRepository() as unknown as AppointmentRepository;
    const patientRepo =
      new InMemoryPatientRepository() as unknown as PatientRepository;
    const service = new CreateAppointmentService(appointmentRepo, patientRepo);

    const input: CreateAppointmentInput = {
      patientId: "patient-1",
      date: new Date(Date.now() + 60 * 60 * 1000),
      notes: "Valid appointment",
    };

    const appointment = await service.execute(input);

    expect(appointment).toHaveProperty("id");
    expect(appointment.patientId).toBe("patient-1");
  });

  it("should throw error if there is already an appointment in the same hour", async () => {
    const appointmentRepo =
      new InMemoryAppointmentRepository() as unknown as AppointmentRepository;
    const patientRepo =
      new InMemoryPatientRepository() as unknown as PatientRepository;
    const service = new CreateAppointmentService(appointmentRepo, patientRepo);

    const baseDate = new Date("2026-02-10T10:15:00Z");

    const input: CreateAppointmentInput = {
      patientId: "patient-1",
      date: baseDate,
      notes: "Appointment 1",
    };

    await service.execute(input);

    const sameHourDate = new Date("2026-02-10T10:45:00Z");

    await expect(
      service.execute({ ...input, date: sameHourDate }),
    ).rejects.toThrow("This time slot is already booked.");
  });

  it("should list all appointments ordered by date ascending", async () => {
    const appointmentRepo = new InMemoryAppointmentRepository();

    const now = Date.now();
    await appointmentRepo.create({
      patientId: "patient-1",
      date: new Date(now + 2 * 60 * 60 * 1000),
      notes: "Appointment 2h",
    });
    await appointmentRepo.create({
      patientId: "patient-1",
      date: new Date(now + 1 * 60 * 60 * 1000),
      notes: "Appointment 1h",
    });

    const all = await appointmentRepo.findAll();

    expect(all).toHaveLength(2);
    expect(all[0].notes).toBe("Appointment 1h");
    expect(all[1].notes).toBe("Appointment 2h");
  });

  it("should list appointments for a patient (including notes)", async () => {
    const appointmentRepo = new InMemoryAppointmentRepository();

    await appointmentRepo.create({
      patientId: "patient-1",
      date: new Date(),
      notes: "Nota A",
    });
    await appointmentRepo.create({
      patientId: "patient-2",
      date: new Date(),
      notes: "Outra nota",
    });

    const patientAppointments =
      await appointmentRepo.findByPatientId("patient-1");

    expect(patientAppointments).toHaveLength(1);
    expect(patientAppointments[0].notes).toBe("Nota A");
  });

  it("should update an appointment", async () => {
    const appointmentRepo = new InMemoryAppointmentRepository();

    const appointment = await appointmentRepo.create({
      patientId: "patient-1",
      date: new Date(),
      notes: "Old",
    });

    const updated = await appointmentRepo.update(appointment.id, {
      notes: "Updated",
    });

    expect(updated.notes).toBe("Updated");
  });

  it("should delete an appointment", async () => {
    const appointmentRepo = new InMemoryAppointmentRepository();

    const appointment = await appointmentRepo.create({
      patientId: "patient-1",
      date: new Date(),
      notes: "To exclude",
    });

    await appointmentRepo.delete(appointment.id);

    const all = await appointmentRepo.findAll();
    expect(all).toHaveLength(0);
  });
});
