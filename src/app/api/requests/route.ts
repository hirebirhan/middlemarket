import { NextResponse } from "next/server";
import { RequestType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import {
  handleApiError,
  optionalAmount,
  optionalText,
  readJson,
  requireEnum,
  requireText,
} from "@/lib/api";

export async function POST(req: Request) {
  try {
    const user = await requireUser("BUYER");
    const body = await readJson(req);

    // Lengths match the form's own `maxLength`, so client and server agree on
    // what is too long rather than the server silently accepting more.
    const title = requireText(body.title, "A title", { max: 120 });
    const description = requireText(body.description, "Details", { max: 2000 });
    const sku = optionalText(body.sku, "Exact model", { max: 120 });
    const type = requireEnum(body.type, Object.values(RequestType), "Type");
    // Was `budget || null`, which accepted a negative budget and turned a
    // 15-digit one into an unhandled Decimal overflow.
    const budget = optionalAmount(body.budget, "Budget");

    const request = await prisma.request.create({
      data: { title, description, sku, type, budget, buyerId: user.id },
    });
    return NextResponse.json(request);
  } catch (e) {
    return handleApiError(e);
  }
}
