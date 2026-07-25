import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, AuthError } from "@/lib/auth";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await requireUser("BUYER");
    const offer = await prisma.offer.findUnique({
      where: { id },
      include: { request: true },
    });
    if (!offer || offer.status !== "APPROVED") {
      return NextResponse.json({ error: "Offer not approved" }, { status: 400 });
    }
    if (offer.request.buyerId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const order = await prisma.$transaction(async (tx) => {
      // Claim the request by flipping OPEN → MATCHED conditionally. If another
      // accept on the same request got here first, the count is 0 and we bail —
      // so one request can never produce two orders.
      const claimed = await tx.request.updateMany({
        where: { id: offer.requestId, status: "OPEN" },
        data: { status: "MATCHED" },
      });
      if (claimed.count === 0) return null;

      await tx.offer.update({
        where: { id: offer.id },
        data: { status: "ACCEPTED" },
      });

      // Close out the losing offers. Left alone they sit in the admin review
      // queue forever and keep showing the buyer an Accept button.
      await tx.offer.updateMany({
        where: {
          requestId: offer.requestId,
          id: { not: offer.id },
          status: { in: ["PENDING_REVIEW", "APPROVED"] },
        },
        data: {
          status: "REJECTED",
          adminNote: "Closed automatically — the buyer accepted another offer.",
        },
      });

      return tx.order.create({ data: { offerId: offer.id } });
    });

    if (!order) {
      return NextResponse.json(
        { error: "This request already has an accepted offer." },
        { status: 409 }
      );
    }

    return NextResponse.json(order);
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}
