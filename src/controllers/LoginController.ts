import { Request, Response } from "express";
import { z } from "zod";
import { UserRepository } from "../repositories/UserRepository";
import { LoginService } from "../services/LoginService";

const LoginSchema = z.object({
  email: z.email(),
  password: z.string().min(4),
});

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15min

type AttemptInfo = {
  count: number;
  firstAttemptAt: number;
};

const attemptsByIp = new Map<string, AttemptInfo>();

function isBlocked(ip: string): boolean {
  const info = attemptsByIp.get(ip);
  if (!info) return false;

  const now = Date.now();
  if (now - info.firstAttemptAt > WINDOW_MS) {
    attemptsByIp.delete(ip);
    return false;
  }

  return info.count >= MAX_ATTEMPTS;
}

function registerFailedAttempt(ip: string) {
  const now = Date.now();
  const info = attemptsByIp.get(ip);

  if (!info) {
    attemptsByIp.set(ip, { count: 1, firstAttemptAt: now });
    return;
  }

  if (now - info.firstAttemptAt > WINDOW_MS) {
    attemptsByIp.set(ip, { count: 1, firstAttemptAt: now });
    return;
  }

  info.count += 1;
  attemptsByIp.set(ip, info);
}

function resetAttempts(ip: string) {
  attemptsByIp.delete(ip);
}

export class LoginController {
  async handle(req: Request, res: Response) {
    const ip =
      (req.headers["x-forwarded-for"] as string) ||
      req.socket.remoteAddress ||
      "unknown";

    if (isBlocked(ip)) {
      return res
        .status(429)
        .json({ error: "Too many login attempts. Please try again later." });
    }

    try {
      const data = LoginSchema.parse(req.body);

      const userRepository = new UserRepository();
      const loginService = new LoginService(userRepository);

      const { token } = await loginService.execute(data);

      resetAttempts(ip);

      return res.json({ token });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.issues });
      }

      registerFailedAttempt(ip);

      return res
        .status(401)
        .json({ error: "Invalid email or password. Please try again." });
    }
  }
}

