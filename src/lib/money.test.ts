import { describe, expect, it } from "vitest";
import { CURRENCY, formatMoney, formatMoneyCompact } from "./money";

/**
 * Money formatting is the one piece of logic in this product that is load
 * bearing for trust, and it is where the worst bug in the codebase lived: the
 * app formatted Ethiopian Birr amounts as US dollars. These lock that shut.
 */

/**
 * `Intl` joins the currency code to the amount with a non-breaking space, so
 * "ETB" can never be left alone at the end of a line. Building expectations
 * through this helper keeps the tests readable and stops a plain space from
 * silently passing.
 */
const etb = (amount: string) => `${CURRENCY} ${amount}`;

describe("formatMoney", () => {
  it("formats in birr, not dollars", () => {
    expect(CURRENCY).toBe("ETB");
    expect(formatMoney(62000)).toBe(etb("62,000"));
    expect(formatMoney(62000)).not.toContain("$");
  });

  it("joins code and amount with a non-breaking space", () => {
    expect(formatMoney(62000)).toContain(" ");
    expect(formatMoney(62000)).not.toContain("ETB ");
  });

  it("omits fraction digits on whole amounts and keeps them otherwise", () => {
    expect(formatMoney(54500)).toBe(etb("54,500"));
    expect(formatMoney(54500.5)).toBe(etb("54,500.50"));
    expect(formatMoney(0.75)).toBe(etb("0.75"));
  });

  it("accepts the shapes a Prisma Decimal arrives as", () => {
    // Prisma `Decimal` is an object whose toString is the value.
    expect(formatMoney({ toString: () => "1234.5" })).toBe(etb("1,234.50"));
    expect(formatMoney("1234")).toBe(etb("1,234"));
  });

  it("returns null rather than a misleading zero for absent values", () => {
    expect(formatMoney(null)).toBeNull();
    expect(formatMoney(undefined)).toBeNull();
    expect(formatMoney("not a number")).toBeNull();
  });

  it("formats zero as a real amount", () => {
    expect(formatMoney(0)).toBe(etb("0"));
  });
});

describe("formatMoneyCompact", () => {
  it("leaves small amounts exact", () => {
    expect(formatMoneyCompact(9999)).toBe(etb("9,999"));
  });

  it("shortens amounts that would overflow a sidebar tile", () => {
    expect(formatMoneyCompact(1_200_000)).toBe(etb("1.2M"));
    expect(formatMoneyCompact(15_000)).toBe(etb("15K"));
  });

  it("uses the same separator as the full formatter", () => {
    expect(formatMoneyCompact(1_200_000)).toContain(" ");
  });

  it("returns null for absent values", () => {
    expect(formatMoneyCompact(null)).toBeNull();
  });
});
