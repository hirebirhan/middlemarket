import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, AuthError } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser("SELLER");
    const { price, message } = await req.json();
    if (!price || !message) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    const request = await prisma.request.findUnique({ where: { id: params.id } });
    if (!request || request.status !== "OPEN") {
      return NextResponse.json({ error: "Request not open" }, { status: 400 });
    }
    const offer = await prisma.offer.create({
      data: { price, message, requestId: params.id, sellerId: user.id },
    });
    return NextResponse.json(offer);
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}
