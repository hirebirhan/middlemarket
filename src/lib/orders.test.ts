import { describe, expect, it } from "vitest";
import type { OrderStatus } from "@prisma/client";
import { ORDER_STATUSES, ORDER_TRANSITIONS, canTransition } from "./orders";

/**
 * The order lifecycle is shared by the admin dropdown and the route that
 * enforces it. If they ever disagree the UI offers a move the server rejects,
 * so the table itself is worth pinning down.
 */
describe("order transitions", () => {
  it("covers every status", () => {
    for (const status of ORDER_STATUSES) {
      expect(ORDER_TRANSITIONS[status]).toBeDefined();
    }
  });

  it("allows the happy path", () => {
    expect(canTransition("PENDING", "IN_PROGRESS")).toBe(true);
    expect(canTransition("IN_PROGRESS", "DELIVERED")).toBe(true);
    expect(canTransition("DELIVERED", "COMPLETED")).toBe(true);
  });

  it("refuses to skip steps", () => {
    expect(canTransition("PENDING", "COMPLETED")).toBe(false);
    expect(canTransition("PENDING", "DELIVERED")).toBe(false);
  });

  it("treats completed and cancelled as final", () => {
    for (const terminal of ["COMPLETED", "CANCELLED"] as OrderStatus[]) {
      expect(ORDER_TRANSITIONS[terminal]).toEqual([]);
      for (const target of ORDER_STATUSES) {
        expect(canTransition(terminal, target)).toBe(false);
      }
    }
  });

  it("lets a delivery be walked back but not a cancellation", () => {
    expect(canTransition("DELIVERED", "IN_PROGRESS")).toBe(true);
    expect(canTransition("CANCELLED", "PENDING")).toBe(false);
  });

  it("never lists a status as a move to itself", () => {
    for (const status of ORDER_STATUSES) {
      expect(ORDER_TRANSITIONS[status]).not.toContain(status);
    }
  });

  it("only ever points at real statuses", () => {
    for (const targets of Object.values(ORDER_TRANSITIONS)) {
      for (const target of targets) {
        expect(ORDER_STATUSES).toContain(target);
      }
    }
  });
});
