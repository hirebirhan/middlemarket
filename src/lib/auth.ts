import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "./prisma";
import { ApiError } from "./api";
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

/**
 * Messages are written for the person who will read them in an alert, not for
 * a log: "Forbidden" told a seller nothing about what to do next.
 */
export async function requireUser(role?: Role): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    throw new AuthError(401, "Your session has expired. Please log in again.");
  }
  if (role && user.role !== role) {
    throw new AuthError(403, "Your account can't do that.");
  }
  return user;
}

/**
 * Extends ApiError so a route's single `handleApiError` catch covers
 * authentication, authorisation and validation alike.
 */
export class AuthError extends ApiError {}
