import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, AuthError } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await requireUser("SELLER");
    const { price, message } = await req.json();

    const amount = Number(price);
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Enter a price greater than 0." },
        { status: 400 }
      );
    }
    const pitch = typeof message === "string" ? message.trim() : "";
    if (!pitch) {
      return NextResponse.json(
        { error: "Tell the buyer what you are offering." },
        { status: 400 }
      );
    }

    const request = await prisma.request.findUnique({ where: { id } });
    if (!request || request.status !== "OPEN") {
      return NextResponse.json({ error: "Request not open" }, { status: 400 });
    }

    // One live offer per seller per request. A rejected offer does not count,
    // so a seller can take the admin's feedback and bid again.
    const live = await prisma.offer.findFirst({
      where: {
        requestId: id,
        sellerId: user.id,
        status: { in: ["PENDING_REVIEW", "APPROVED", "ACCEPTED"] },
      },
    });
    if (live) {
      return NextResponse.json(
        { error: "You already have an offer on this request." },
        { status: 409 }
      );
    }

    const offer = await prisma.offer.create({
      data: { price: amount, message: pitch, requestId: id, sellerId: user.id },
    });
    return NextResponse.json(offer);
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}
