import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signSession, setSessionCookie } from "@/lib/auth";

export async function POST(req: Request) {
  const { email, password, name, role } = await req.json();
  if (!email || !password || !name) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  if (role !== "BUYER" && role !== "SELLER") {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }
  const user = await prisma.user.create({
    data: { email, name, role, password: await bcrypt.hash(password, 10) },
  });
  await setSessionCookie(signSession({ userId: user.id, role: user.role }));
  return NextResponse.json({ id: user.id, email: user.email, name: user.name, role: user.role });
}
