import { describe, expect, it } from "vitest";
import { barHeightPercent, formatUtcWeekday, trendDirection, trendPercentChange } from "./analytics";

describe("analytics display", () => {
  it("labels a UTC date key as that UTC weekday", () => {
    expect(formatUtcWeekday("2026-09-01")).toBe("Tue");
  });

  it("returns impossible calendar dates unchanged instead of rolling them over", () => {
    expect(formatUtcWeekday("2026-02-30")).toBe("2026-02-30");
    expect(formatUtcWeekday("2026-13-01")).toBe("2026-13-01");
    expect(formatUtcWeekday("2026-04-00")).toBe("2026-04-00");
    expect(formatUtcWeekday("2028-02-29")).toBe("Tue");
  });

  it("does not divide by zero when every bucket is empty", () => {
    expect(barHeightPercent(0, 0)).toBe(0);
    expect(barHeightPercent(3, 6)).toBe(50);
  });

  it("does not invent an upward trend when the change is missing", () => {
    expect(trendDirection(undefined)).toBeUndefined();
    expect(trendDirection(12)).toBe("up");
    expect(trendDirection(-3)).toBe("down");
    expect(trendDirection(0)).toBe("neutral");
  });

  it("computes the change from the series instead of a fixed percent", () => {
    expect(trendPercentChange([10, 10, 20, 20])).toBe(100);
    expect(trendPercentChange([0, 5])).toBeNull();
    expect(trendPercentChange([10, 10, 10, 10, 10, 10, 10])).toBe(0);
    expect(trendPercentChange([10, 10, 10, 99, 20, 20, 20])).toBe(100);
  });
});
