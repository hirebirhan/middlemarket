import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "./prisma";
import type { Role, User } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const COOKIE_NAME = "mp_session";

export type SessionPayload = { userId: string; role: Role };

export function signSession(payload: SessionPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export async function setSessionCookie(token: string) {
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function getCurrentUser(): Promise<User | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, JWT_SECRET) as SessionPayload;
    return await prisma.user.findUnique({ where: { id: payload.userId } });
  } catch {
    return null;
  }
}

export async function requireUser(role?: Role): Promise<User> {
  const user = await getCurrentUser();
  if (!user) throw new AuthError(401, "Not authenticated");
  if (role && user.role !== role) throw new AuthError(403, "Forbidden");
  return user;
}

export class AuthError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
