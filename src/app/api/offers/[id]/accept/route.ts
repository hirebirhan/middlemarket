import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, AuthError } from "@/lib/auth";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser("BUYER");
    const offer = await prisma.offer.findUnique({
      where: { id: params.id },
      include: { request: true },
    });
    if (!offer || offer.status !== "APPROVED") {
      return NextResponse.json({ error: "Offer not approved" }, { status: 400 });
    }
    if (offer.request.buyerId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const [order] = await prisma.$transaction([
      prisma.order.create({ data: { offerId: offer.id } }),
      prisma.offer.update({ where: { id: offer.id }, data: { status: "ACCEPTED" } }),
      prisma.request.update({ where: { id: offer.requestId }, data: { status: "MATCHED" } }),
    ]);
    return NextResponse.json(order);
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}
