import { NextResponse } from "next/server";
import { Condition } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser, AuthError } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await requireUser("SELLER");
    const { price, message, condition } = await req.json();

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
    // `in` would also match prototype keys like "constructor" and "toString",
    // which then reach Prisma as an invalid enum and throw a 500.
    const conditionValue: Condition | null = Object.values(Condition).includes(
      condition as Condition
    )
      ? (condition as Condition)
      : null;

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
      data: {
        price: amount,
        message: pitch,
        condition: conditionValue as never,
        requestId: id,
        sellerId: user.id,
      },
    });
    return NextResponse.json(offer);
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}
