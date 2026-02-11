import bcrypt from "bcryptjs";
import { UserRepository } from "../src/repositories/UserRepository";
import { LoginService } from "../src/services/LoginService";

class InMemoryUserRepository implements Partial<UserRepository> {
  private readonly users: any[] = [];

  async findByEmail(email: string) {
    return this.users.find((u) => u.email === email) ?? null;
  }

  async updateCurrentSession(id: string, sessionId: string | null) {
    const index = this.users.findIndex((u) => u.id === id);
    if (index >= 0) {
      this.users[index].currentSessionId = sessionId;
    }
  }

  seed(user: any) {
    this.users.push(user);
  }
}

describe("LoginService", () => {
  const jwtSecretBackup = process.env.JWT_SECRET;

  beforeAll(() => {
    process.env.JWT_SECRET = "test-secret";
  });

  afterAll(() => {
    process.env.JWT_SECRET = jwtSecretBackup;
  });

  it("should return a valid token for correct credentials", async () => {
    const repository =
      new InMemoryUserRepository() as unknown as UserRepository;
    const service = new LoginService(repository);

    const password = "senha123";
    const passwordHash = await bcrypt.hash(password, 10);

    (repository as any).seed({
      id: "user-1",
      email: "medico@teste.com",
      passwordHash,
      currentSessionId: null,
    });

    const result = await service.execute({
      email: "medico@teste.com",
      password,
    });

    expect(result.token).toBeDefined();
    expect(typeof result.token).toBe("string");
  });

  it("should fail for invalid credentials", async () => {
    const repository =
      new InMemoryUserRepository() as unknown as UserRepository;
    const service = new LoginService(repository);

    await expect(
      service.execute({
        email: "naoexiste@teste.com",
        password: "qualquer",
      }),
    ).rejects.toThrow("Invalid credentials.");
  });
});
