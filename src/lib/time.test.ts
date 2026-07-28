import { describe, expect, it } from "vitest";
import { formatPostedAge } from "./time";

const NOW = new Date("2026-07-28T12:00:00Z");

function daysAgo(n: number) {
  return new Date(NOW.getTime() - n * 24 * 60 * 60 * 1000);
}

describe("formatPostedAge", () => {
  it("says today for same-day posts", () => {
    expect(formatPostedAge(daysAgo(0), NOW)).toBe("today");
  });

  it("says yesterday for one-day-old posts", () => {
    expect(formatPostedAge(daysAgo(1), NOW)).toBe("yesterday");
  });

  it("counts days under two weeks", () => {
    expect(formatPostedAge(daysAgo(6), NOW)).toBe("6 days ago");
  });

  it("falls back to a calendar date past two weeks", () => {
    expect(formatPostedAge(daysAgo(30), NOW)).toBe("Jun 28");
  });

  it("includes the year for older years", () => {
    expect(formatPostedAge(new Date("2025-01-05T00:00:00Z"), NOW)).toBe(
      "Jan 5, 2025"
    );
  });
});
