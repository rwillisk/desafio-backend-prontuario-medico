import bcrypt from "bcryptjs";
import crypto from "crypto";
import { SignJWT } from "jose";
import { TextEncoder } from "util";
import { UserRepository } from "../repositories/UserRepository";
import { LoginInput, LoginResult } from "../types/auth";

export class LoginService {
  constructor(private readonly userRepository: UserRepository) {}

  async execute({ email, password }: LoginInput): Promise<LoginResult> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new Error("Invalid credentials.");
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      throw new Error("Invalid credentials.");
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error("JWT_SECRET is not configured.");
    }

    const secretKey = new TextEncoder().encode(jwtSecret);

    const sessionId = crypto.randomUUID();

    // Updates the user with the new session (invalidates any previous session)
    await this.userRepository.updateCurrentSession(user.id, sessionId);

    const token = await new SignJWT({
      sub: user.id,
      email: user.email,
      jti: sessionId,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("1h")
      .sign(secretKey);

    return { token };
  }
}
