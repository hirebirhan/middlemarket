import { describe, expect, it } from "vitest";
import { getRoleHome } from "./role-home";

describe("getRoleHome", () => {
  it("routes operators to their workspaces", () => {
    expect(getRoleHome("ADMIN")).toBe("/admin");
    expect(getRoleHome("SELLER")).toBe("/seller");
    expect(getRoleHome("BUYER")).toBe("/buyer");
  });

  it("preserves buyer request intent", () => {
    expect(
      getRoleHome("BUYER", {
        buyerNeed: "CCTV installation",
        requestType: "SERVICE",
      })
    ).toBe("/buyer/new?need=CCTV+installation&type=SERVICE");
  });

  it("routes to a typed request form even without a typed need", () => {
    expect(getRoleHome("BUYER", { requestType: "PRODUCT" })).toBe(
      "/buyer/new?type=PRODUCT"
    );
  });
});
