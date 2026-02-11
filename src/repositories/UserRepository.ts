import { PrismaClient, User } from "@prisma/client";

const prisma = new PrismaClient();

export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async updateCurrentSession(
    id: string,
    sessionId: string | null,
  ): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: {
        currentSessionId: sessionId,
      },
    });
  }
}
