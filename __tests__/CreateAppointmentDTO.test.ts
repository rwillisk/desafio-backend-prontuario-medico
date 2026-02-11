import { CreateAppointmentSchema } from "../src/dtos/CreateAppointmentDTO";

describe("Appointment validation (DTO)", () => {
  it("should allow future date", () => {
    const futureDate = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    const parsed = CreateAppointmentSchema.parse({
      patientId: "550e8400-e29b-41d4-a716-446655440000",
      date: futureDate,
      notes: "Ok",
    });

    expect(parsed.date).toBeInstanceOf(Date);
  });

  it("should fail for past date", () => {
    const pastDate = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    expect(() =>
      CreateAppointmentSchema.parse({
        patientId: "550e8400-e29b-41d4-a716-446655440000",
        date: pastDate,
        notes: "Passado",
      }),
    ).toThrow();
  });
});
