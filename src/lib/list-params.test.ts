import { describe, expect, it } from "vitest";
import {
  listHref,
  paginate,
  readOption,
  readPage,
  readParam,
} from "./list-params";

/**
 * These read values straight off the URL, so every case here is something a
 * user can actually produce: an edited address, a stale bookmark, a back
 * button pressed after a filter narrowed the list.
 */
describe("readParam", () => {
  it("trims and drops empties", () => {
    expect(readParam({ q: "  iphone " }, "q")).toBe("iphone");
    expect(readParam({ q: "   " }, "q")).toBeUndefined();
    expect(readParam({}, "q")).toBeUndefined();
  });

  it("takes the first value of a repeated key", () => {
    expect(readParam({ q: ["a", "b"] }, "q")).toBe("a");
  });
});

describe("readOption", () => {
  const views = ["all", "new"] as const;

  it("accepts a known option", () => {
    expect(readOption({ v: "new" }, "v", views, "all")).toBe("new");
  });

  it("falls back rather than producing an unexplainable empty list", () => {
    expect(readOption({ v: "bogus" }, "v", views, "all")).toBe("all");
    expect(readOption({}, "v", views, "all")).toBe("all");
    // Prototype keys must not be treated as valid options.
    expect(readOption({ v: "constructor" }, "v", views, "all")).toBe("all");
  });
});

describe("readPage", () => {
  it("reads a positive integer", () => {
    expect(readPage({ page: "3" }, "page")).toBe(3);
  });

  it("falls back to page 1 for anything that is not a positive integer", () => {
    for (const value of ["0", "-2", "abc", "1.5", ""]) {
      expect(readPage({ page: value }, "page")).toBe(1);
    }
    expect(readPage({}, "page")).toBe(1);
  });

  it("accepts an absurd but well-formed page, which paginate then clamps", () => {
    // "1e3" parses to 1000. Letting it through is safe precisely because
    // `paginate` never returns a page past the end of the data.
    expect(readPage({ page: "1e3" }, "page")).toBe(1000);
    expect(paginate(15, readPage({ page: "1e3" }, "page"), 10).page).toBe(2);
  });
});

describe("paginate", () => {
  it("describes the visible window", () => {
    const page = paginate(42, 1, 10);
    expect(page).toMatchObject({
      skip: 0,
      take: 10,
      page: 1,
      totalPages: 5,
      from: 1,
      to: 10,
    });
  });

  it("reports a short final page honestly", () => {
    expect(paginate(42, 5, 10)).toMatchObject({ from: 41, to: 42, skip: 40 });
  });

  it("clamps past the end instead of showing nothing", () => {
    // A filter that shrinks the result set can strand you on page 9 of 2.
    expect(paginate(15, 99, 10)).toMatchObject({ page: 2, from: 11, to: 15 });
  });

  it("stays coherent when there is nothing to show", () => {
    expect(paginate(0, 1, 10)).toMatchObject({
      page: 1,
      totalPages: 1,
      from: 0,
      to: 0,
    });
  });
});

describe("listHref", () => {
  it("preserves the params it is not changing", () => {
    expect(listHref("/seller", { q: "dell", offers: "won" }, { rpage: 3 })).toBe(
      "/seller?q=dell&offers=won&rpage=3"
    );
  });

  it("clears a key on null, keeping defaults out of the URL", () => {
    expect(listHref("/seller", { q: "dell", rpage: "4" }, { rpage: null })).toBe(
      "/seller?q=dell"
    );
    expect(listHref("/seller", { rpage: "4" }, { rpage: null })).toBe("/seller");
  });

  it("escapes values that would otherwise break the query string", () => {
    expect(listHref("/seller", {}, { q: "65\" tv & stand" })).toBe(
      "/seller?q=65%22+tv+%26+stand"
    );
  });
});
