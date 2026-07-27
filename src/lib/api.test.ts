import { describe, expect, it } from "vitest";
import {
  ApiError,
  optionalAmount,
  optionalEnum,
  optionalText,
  readJson,
  requireAmount,
  requireEnum,
  requireText,
} from "./api";

/**
 * Each case below is a request that previously either saved bad data or came
 * back as an unhandled 500. The point of these tests is that a bad request
 * stays a 4xx with a sentence a person can act on.
 */

function status(fn: () => unknown) {
  try {
    fn();
  } catch (e) {
    return e instanceof ApiError ? e.status : "not-an-ApiError";
  }
  return "no-throw";
}

describe("readJson", () => {
  it("rejects a body that is not JSON as a 400, not a crash", async () => {
    const req = new Request("http://t/", { method: "POST", body: "not json" });
    await expect(readJson(req)).rejects.toMatchObject({ status: 400 });
  });

  it("rejects JSON that is not an object", async () => {
    const req = new Request("http://t/", { method: "POST", body: "[1,2]" });
    await expect(readJson(req)).rejects.toMatchObject({ status: 400 });
  });

  it("returns an object body", async () => {
    const req = new Request("http://t/", { method: "POST", body: '{"a":1}' });
    await expect(readJson(req)).resolves.toEqual({ a: 1 });
  });
});

describe("requireText", () => {
  it("trims, so a field of spaces is empty", () => {
    expect(requireText("  hello ", "Title")).toBe("hello");
    expect(status(() => requireText("   ", "Title"))).toBe(400);
    expect(status(() => requireText(undefined, "Title"))).toBe(400);
    expect(status(() => requireText(42, "Title"))).toBe(400);
  });

  it("caps length so one row cannot carry a megabyte of text", () => {
    expect(status(() => requireText("x".repeat(200), "Title", { max: 120 }))).toBe(
      400
    );
  });

  it("names the field in the message", () => {
    try {
      requireText("", "A title");
    } catch (e) {
      expect((e as ApiError).message).toBe("A title is required.");
    }
  });
});

describe("optionalText", () => {
  it("treats blank as absent", () => {
    expect(optionalText("   ", "SKU")).toBeNull();
    expect(optionalText(null, "SKU")).toBeNull();
    expect(optionalText(" x ", "SKU")).toBe("x");
  });
});

describe("amounts", () => {
  it("rejects the negative budget that used to save happily", () => {
    expect(status(() => optionalAmount(-500, "Budget"))).toBe(400);
    expect(status(() => requireAmount(0, "Price"))).toBe(400);
  });

  it("rejects values that would overflow Decimal(12,2)", () => {
    expect(status(() => optionalAmount(999_999_999_999_999, "Budget"))).toBe(400);
  });

  it("rejects non-numbers instead of storing NaN", () => {
    expect(status(() => requireAmount("abc", "Price"))).toBe(400);
    expect(status(() => requireAmount(Infinity, "Price"))).toBe(400);
  });

  it("rounds to the two decimal places the column stores", () => {
    expect(requireAmount(10.005, "Price")).toBe(10.01);
    expect(requireAmount("54500", "Price")).toBe(54500);
  });

  it("treats absent optional amounts as null", () => {
    expect(optionalAmount(null, "Budget")).toBeNull();
    expect(optionalAmount("", "Budget")).toBeNull();
  });
});

describe("enums", () => {
  const roles = ["BUYER", "SELLER"] as const;

  it("accepts a member", () => {
    expect(requireEnum("SELLER", roles, "Role")).toBe("SELLER");
  });

  it("rejects a non-member, including one that would grant admin", () => {
    expect(status(() => requireEnum("ADMIN", roles, "Role"))).toBe(400);
  });

  it("rejects prototype keys that would reach Prisma as a bad enum", () => {
    expect(status(() => requireEnum("constructor", roles, "Role"))).toBe(400);
    expect(status(() => requireEnum("toString", roles, "Role"))).toBe(400);
  });

  it("lists the valid options in the message", () => {
    try {
      requireEnum("X", roles, "Account type");
    } catch (e) {
      expect((e as ApiError).message).toContain("BUYER, SELLER");
    }
  });

  it("treats absent optional enums as null", () => {
    expect(optionalEnum(null, roles, "Role")).toBeNull();
    expect(optionalEnum("", roles, "Role")).toBeNull();
  });
});
