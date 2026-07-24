import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, AuthError } from "@/lib/auth";

const STATUSES = ["PENDING", "IN_PROGRESS", "DELIVERED", "COMPLETED", "CANCELLED"];

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireUser("ADMIN");
    const { status } = await req.json();
    if (!STATUSES.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    const order = await prisma.order.update({ where: { id: params.id }, data: { status } });
    return NextResponse.json(order);
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}
