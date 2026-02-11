import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { jwtVerify } from "jose";
import { TextEncoder } from "util";

const prisma = new PrismaClient();

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Token not provided." });
  }

  const [, token] = authHeader.split(" ");

  if (!token) {
    return res.status(401).json({ error: "Token not provided." });
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    return res.status(500).json({ error: "JWT secret not configured." });
  }

  try {
    const secretKey = new TextEncoder().encode(jwtSecret);

    const { payload } = await jwtVerify(token, secretKey);

    const userId = payload.sub as string | undefined;
    const tokenSessionId = payload.jti as string | undefined;

    if (!userId || !tokenSessionId) {
      return res.status(401).json({ error: "Invalid token payload." });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(401).json({ error: "User not found." });
    }

    // Grant unique session
    if (user.currentSessionId !== tokenSessionId) {
      return res.status(401).json({ error: "Session is no longer valid." });
    }

    // Add userId to request for use in controllers
    req.userId = userId;

    return next();
  } catch (error) {
    console.error("Token verification failed:", error);
    return res.status(401).json({ error: "Invalid or expired token." });
  }
}
