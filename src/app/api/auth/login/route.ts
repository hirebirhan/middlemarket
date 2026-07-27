import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signSession, setSessionCookie } from "@/lib/auth";
import { handleApiError, readJson, requireText } from "@/lib/api";

export async function POST(req: Request) {
  try {
    const body = await readJson(req);
    // A missing password used to reach `bcrypt.compare(undefined, …)` and
    // throw — a 500 from the login endpoint for the ordinary case of a form
    // submitted empty.
    const email = requireText(body.email, "Email", { max: 320 });
    const password = requireText(body.password, "Password", { max: 200 });

    const user = await prisma.user.findUnique({ where: { email } });
    // One message for both branches, so the response cannot be used to
    // discover which email addresses have accounts here.
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json(
        { error: "That email and password don't match an account." },
        { status: 401 }
      );
    }

    await setSessionCookie(signSession({ userId: user.id, role: user.role }));
    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (e) {
    return handleApiError(e);
  }
}
