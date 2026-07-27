import { describe, expect, it } from "vitest";
import { readRequestIntentType } from "./request-intent";

describe("readRequestIntentType", () => {
  it("normalizes known request types", () => {
    expect(readRequestIntentType("product")).toBe("PRODUCT");
    expect(readRequestIntentType(" SERVICE ")).toBe("SERVICE");
  });

  it("takes the first repeated value", () => {
    expect(readRequestIntentType(["service", "product"])).toBe("SERVICE");
  });

  it("drops unknown values", () => {
    expect(readRequestIntentType("category")).toBeUndefined();
    expect(readRequestIntentType(null)).toBeUndefined();
  });
});
