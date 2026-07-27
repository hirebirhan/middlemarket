import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { signSession, setSessionCookie } from "@/lib/auth";
import {
  ApiError,
  handleApiError,
  readJson,
  requireEnum,
  requireText,
} from "@/lib/api";

/** ADMIN is deliberately absent: admin accounts are seeded, never signed up. */
const SIGNUP_ROLES = ["BUYER", "SELLER"] as const;

/** Matches the client's `minLength={6}`, and the hint shown under the field. */
const MIN_PASSWORD = 6;

export async function POST(req: Request) {
  try {
    const body = await readJson(req);
    const email = requireText(body.email, "Email", { max: 320 });
    const name = requireText(body.name, "Your name", { max: 120 });
    const password = requireText(body.password, "Password", { max: 200 });
    const role = requireEnum(body.role, SIGNUP_ROLES, "Account type");

    // A shape check, not an RFC-complete one — the address is proven by being
    // able to use it, and an over-strict pattern rejects valid addresses.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new ApiError(400, "Enter a valid email address.");
    }
    if (password.length < MIN_PASSWORD) {
      throw new ApiError(
        400,
        `Your password must be at least ${MIN_PASSWORD} characters.`
      );
    }

    const user = await prisma.user.create({
      data: { email, name, role, password: await bcrypt.hash(password, 10) },
    });

    await setSessionCookie(signSession({ userId: user.id, role: user.role }));
    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (e) {
    // The find-then-create check it replaces had a race: two simultaneous
    // signups for the same address both saw "available" and one crashed. The
    // unique index is the only thing that can actually decide this.
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "That email is already registered. Try logging in instead." },
        { status: 409 }
      );
    }
    return handleApiError(e);
  }
}
