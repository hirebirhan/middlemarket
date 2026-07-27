import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { ApiError, handleApiError } from "@/lib/api";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await requireUser("BUYER");
    const offer = await prisma.offer.findUnique({
      where: { id },
      include: { request: true },
    });
    if (!offer) throw new ApiError(404, "That offer no longer exists.");
    // Ownership is checked before status, so the response to someone else's
    // offer id is the same whatever state it happens to be in.
    if (offer.request.buyerId !== user.id) {
      throw new ApiError(403, "That offer isn't on one of your requests.");
    }
    if (offer.status !== "APPROVED") {
      throw new ApiError(
        409,
        offer.status === "ACCEPTED"
          ? "You have already accepted this offer."
          : "This offer is no longer available to accept."
      );
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
      throw new ApiError(409, "This request already has an accepted offer.");
    }

    return NextResponse.json(order);
  } catch (e) {
    return handleApiError(e);
  }
}
