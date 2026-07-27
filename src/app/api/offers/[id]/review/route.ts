import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import {
  ApiError,
  handleApiError,
  optionalAmount,
  optionalText,
  readJson,
  requireEnum,
} from "@/lib/api";

const ACTIONS = ["APPROVE", "REJECT"] as const;

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await requireUser("ADMIN");
    const body = await readJson(req);

    const action = requireEnum(body.action, ACTIONS, "Action");
    const note = optionalText(body.adminNote, "Note", { max: 2000 });

    // A rejection the seller cannot understand is a dead end for them — the
    // offer just disappears with no way to learn what to fix.
    if (action === "REJECT" && !note) {
      throw new ApiError(400, "Tell the seller why this offer was rejected.");
    }

    // An adjusted price is only meaningful on an approval; storing one on a
    // rejected offer leaves a price nobody can act on.
    const adminPrice =
      action === "APPROVE"
        ? optionalAmount(body.adminPrice, "Adjusted price")
        : null;

    // The fair-price band the admin benchmarked against (Gate 3). Recorded on
    // both approve and reject — a rejection above the band is signal too.
    const bandLow = optionalAmount(body.bandLow, "Fair-price band low");
    const bandHigh = optionalAmount(body.bandHigh, "Fair-price band high");
    if (bandLow !== null && bandHigh !== null && bandLow > bandHigh) {
      throw new ApiError(400, "Fair-price band low must be ≤ high.");
    }

    // Conditional update: the status check and the write are one statement, so
    // two admins reviewing the same offer cannot both succeed.
    const claimed = await prisma.offer.updateMany({
      where: { id, status: "PENDING_REVIEW" },
      data: {
        status: action === "APPROVE" ? "APPROVED" : "REJECTED",
        adminPrice,
        adminNote: note,
        bandLow,
        bandHigh,
      },
    });

    if (claimed.count === 0) {
      const exists = await prisma.offer.findUnique({ where: { id } });
      throw exists
        ? new ApiError(409, "This offer has already been reviewed.")
        : new ApiError(404, "That offer no longer exists.");
    }

    const updated = await prisma.offer.findUnique({ where: { id } });
    return NextResponse.json(updated);
  } catch (e) {
    return handleApiError(e);
  }
}
