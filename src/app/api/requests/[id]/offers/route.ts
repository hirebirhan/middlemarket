import { NextResponse } from "next/server";
import { Condition } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import {
  ApiError,
  handleApiError,
  optionalEnum,
  readJson,
  requireAmount,
  requireText,
} from "@/lib/api";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await requireUser("SELLER");
    const body = await readJson(req);

    const price = requireAmount(body.price, "Your price");
    const message = requireText(body.message, "Your pitch", { max: 2000 });
    // `optionalEnum` checks membership of the enum's own values, so a
    // prototype key like "constructor" cannot reach Prisma and 500 there.
    const condition = optionalEnum(
      body.condition,
      Object.values(Condition),
      "Condition"
    );

    const request = await prisma.request.findUnique({ where: { id } });
    if (!request) throw new ApiError(404, "That request no longer exists.");
    if (request.status !== "OPEN") {
      throw new ApiError(
        409,
        "This request is closed — the buyer has already chosen an offer."
      );
    }
    // A product offer without a condition is exactly what the review rubric's
    // first gate exists to reject, so it is not accepted in the first place.
    if (request.type === "PRODUCT" && !condition) {
      throw new ApiError(400, "Say what condition the item is in.");
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
      throw new ApiError(409, "You already have an offer on this request.");
    }

    const offer = await prisma.offer.create({
      data: { price, message, condition, requestId: id, sellerId: user.id },
    });
    return NextResponse.json(offer);
  } catch (e) {
    return handleApiError(e);
  }
}
