import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, AuthError } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await requireUser("BUYER");
    const { title, description, sku, type, budget } = await req.json();
    if (!title || !description || (type !== "PRODUCT" && type !== "SERVICE")) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    const skuValue = typeof sku === "string" && sku.trim() ? sku.trim() : null;
    const request = await prisma.request.create({
      data: {
        title,
        description,
        sku: skuValue,
        type,
        budget: budget || null,
        buyerId: user.id,
      },
    });
    return NextResponse.json(request);
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}
