import { describe, expect, it } from "vitest";
import { barHeightPercent, formatUtcWeekday, trendPercentChange } from "./analytics";

describe("analytics display", () => {
  it("labels a UTC date key as that UTC weekday", () => {
    expect(formatUtcWeekday("2026-09-01")).toBe("Tue");
  });

  it("does not divide by zero when every bucket is empty", () => {
    expect(barHeightPercent(0, 0)).toBe(0);
    expect(barHeightPercent(3, 6)).toBe(50);
  });

  it("computes the change from the series instead of a fixed percent", () => {
    expect(trendPercentChange([10, 10, 20, 20])).toBe(100);
    expect(trendPercentChange([0, 5])).toBeNull();
  });
});
