import { CreatePatientInput } from "../src/dtos/CreatePatientDTO";
import { IPatientRepository } from "../src/repositories/interfaces/IPatientRepository";
import { AnonymizePatientService } from "../src/services/AnonymizePatientService";
import { CreatePatientService } from "../src/services/CreatePatientService";
import { UpdatePatientService } from "../src/services/UpdatePatientService";

class InMemoryPatientRepository implements IPatientRepository {
  private patients: any[] = [];

  async findByEmail(email: string) {
    return this.patients.find((p) => p.email === email) ?? null;
  }

  async create(data: CreatePatientInput) {
    const patient = {
      id: (this.patients.length + 1).toString(),
      isAnonymized: false,
      ...data,
    };
    this.patients.push(patient);
    return patient as any;
  }

  async findAll() {
    return [...this.patients].sort((a, b) =>
      a.name.localeCompare(b.name),
    ) as any;
  }

  async findById(id: string) {
    return this.patients.find((p) => p.id === id) ?? null;
  }

  async update(id: string, data: Partial<CreatePatientInput>) {
    const index = this.patients.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error("Patient not found.");
    }
    this.patients[index] = { ...this.patients[index], ...data };
    return this.patients[index];
  }

  async anonymize(id: string) {
    const index = this.patients.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error("Patient not found.");
    }
    this.patients[index] = {
      ...this.patients[index],
      name: null,
      email: null,
      phone: null,
      birthDate: null,
      gender: null,
      height: null,
      weight: null,
      isAnonymized: true,
    };
  }
}

describe("Patient Rules", () => {
  it("should create a patient when email does not exist", async () => {
    const repository = new InMemoryPatientRepository();
    const service = new CreatePatientService(repository);

    const input: CreatePatientInput = {
      name: "John Doe",
      email: "john@example.com",
      phone: "11999999999",
      birthDate: new Date("1990-01-01"),
      gender: "M",
      height: 1.8,
      weight: 80,
    };

    const patient = await service.execute(input);

    expect(patient).toHaveProperty("id");
    expect(patient.email).toBe(input.email);
  });

  it("should throw error if there is already a patient with the same email", async () => {
    const repository = new InMemoryPatientRepository();
    const service = new CreatePatientService(repository);

    const input: CreatePatientInput = {
      name: "John Doe",
      email: "john@example.com",
      phone: "11999999999",
      birthDate: new Date("1990-01-01"),
      gender: "M",
      height: 1.8,
      weight: 80,
    };

    await service.execute(input);

    await expect(service.execute(input)).rejects.toThrow(
      "Patient already exists with this email.",
    );
  });

  it("should list patients ordered by name", async () => {
    const repository = new InMemoryPatientRepository();

    await repository.create({
      name: "Zezinho",
      email: "z@example.com",
      phone: "11999999999",
      birthDate: new Date("1990-01-01"),
      gender: "M",
      height: 1.8,
      weight: 80,
    });

    await repository.create({
      name: "Ana",
      email: "a@example.com",
      phone: "11999999999",
      birthDate: new Date("1990-01-01"),
      gender: "F",
      height: 1.7,
      weight: 60,
    });

    const all = await repository.findAll();

    expect(all).toHaveLength(2);
    expect(all[0].name).toBe("Ana");
    expect(all[1].name).toBe("Zezinho");
  });

  it("should update a patient", async () => {
    const repository = new InMemoryPatientRepository();

    const createService = new CreatePatientService(repository);
    const updateService = new UpdatePatientService(repository);

    const created = await createService.execute({
      name: "Original",
      email: "orig@example.com",
      phone: "11999999999",
      birthDate: new Date("1990-01-01"),
      gender: "M",
      height: 1.8,
      weight: 80,
    });

    const updated = await updateService.execute(created.id, {
      name: "Updated",
    });

    expect(updated.name).toBe("Updated");
  });

  it("should anonymize a patient (LGPD)", async () => {
    const repository = new InMemoryPatientRepository();

    const createService = new CreatePatientService(repository);
    const anonymizeService = new AnonymizePatientService(repository);

    const created = await createService.execute({
      name: "Privado",
      email: "privado@example.com",
      phone: "11999999999",
      birthDate: new Date("1990-01-01"),
      gender: "M",
      height: 1.8,
      weight: 80,
    });

    await anonymizeService.execute(created.id);

    const after = await repository.findById(created.id);

    expect(after.name).toBeNull();
    expect(after.email).toBeNull();
    expect(after.phone).toBeNull();
    expect(after.isAnonymized).toBe(true);
  });
});
