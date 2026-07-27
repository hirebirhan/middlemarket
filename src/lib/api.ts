import { NextResponse } from "next/server";

/**
 * Shared request handling for the route handlers.
 *
 * Every route previously did `await req.json()` unguarded and trusted whatever
 * came back. A body that was not JSON, or that simply omitted a field, threw
 * past the handler and became a 500 — an unhandled server error reported to
 * the user as "something went wrong at our end" for what is squarely a bad
 * request. Worse, some invalid values got through: a negative budget and a
 * whitespace-only title both saved happily.
 *
 * The rule here is that a route states what it needs, and anything that does
 * not meet it comes back as a 4xx carrying a sentence a person can act on.
 */
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

/** Parses a JSON body, or fails as a 400 rather than an unhandled throw. */
export async function readJson(req: Request): Promise<Record<string, unknown>> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new ApiError(400, "Expected a JSON body.");
  }
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw new ApiError(400, "Expected a JSON object.");
  }
  return body as Record<string, unknown>;
}

/**
 * Required free text. Trims first, so a field of spaces is empty — which is
 * how a request with a blank title used to reach the buyer's dashboard.
 *
 * `max` is not a nicety: `String` columns are unbounded in Postgres, so
 * without a cap a single request can carry a megabyte of text into every list
 * that renders it.
 */
export function requireText(
  value: unknown,
  field: string,
  { max = 2000 }: { max?: number } = {}
): string {
  if (typeof value !== "string") {
    throw new ApiError(400, `${field} is required.`);
  }
  const trimmed = value.trim();
  if (!trimmed) throw new ApiError(400, `${field} is required.`);
  if (trimmed.length > max) {
    throw new ApiError(400, `${field} must be ${max} characters or fewer.`);
  }
  return trimmed;
}

/** Optional free text. Empty and whitespace-only both mean "not given". */
export function optionalText(
  value: unknown,
  field: string,
  { max = 2000 }: { max?: number } = {}
): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") {
    throw new ApiError(400, `${field} must be text.`);
  }
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.length > max) {
    throw new ApiError(400, `${field} must be ${max} characters or fewer.`);
  }
  return trimmed;
}

/**
 * Prices are `Decimal(12, 2)`. Anything at or above this overflows the column
 * and surfaces as a database error — which is how a fat-fingered budget became
 * a 500 instead of "that is too large".
 */
const MAX_AMOUNT = 9_999_999_999;

function parseAmount(value: unknown, field: string): number {
  const amount = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(amount)) {
    throw new ApiError(400, `${field} must be a number.`);
  }
  if (amount <= 0) {
    throw new ApiError(400, `${field} must be greater than 0.`);
  }
  if (amount > MAX_AMOUNT) {
    throw new ApiError(400, `${field} is too large.`);
  }
  // Two decimal places, matching the column. Rounding here rather than letting
  // Postgres do it keeps what the user is told and what is stored identical.
  return Math.round(amount * 100) / 100;
}

export function requireAmount(value: unknown, field: string): number {
  if (value === null || value === undefined || value === "") {
    throw new ApiError(400, `${field} is required.`);
  }
  return parseAmount(value, field);
}

export function optionalAmount(value: unknown, field: string): number | null {
  if (value === null || value === undefined || value === "") return null;
  return parseAmount(value, field);
}

/** Narrows to one of a fixed set, e.g. a Prisma enum. */
export function requireEnum<T extends string>(
  value: unknown,
  allowed: readonly T[],
  field: string
): T {
  if (typeof value === "string" && (allowed as readonly string[]).includes(value)) {
    return value as T;
  }
  throw new ApiError(400, `${field} must be one of: ${allowed.join(", ")}.`);
}

export function optionalEnum<T extends string>(
  value: unknown,
  allowed: readonly T[],
  field: string
): T | null {
  if (value === null || value === undefined || value === "") return null;
  return requireEnum(value, allowed, field);
}

/**
 * The single catch for a route handler. Known failures become their status;
 * anything else is logged and returned as an opaque 500, so an internal
 * message never leaks to the client.
 */
export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error("Unhandled API error:", error);
  return NextResponse.json(
    { error: "Something went wrong at our end. Please try again." },
    { status: 500 }
  );
}
