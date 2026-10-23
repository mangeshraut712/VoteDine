import { describe, expect, it } from "vitest";
import { addVotesToBuckets, bucketsToTrend, buildUtcDayBuckets, utcDayKey } from "./dates.js";

describe("UTC vote buckets", () => {
  it("keeps a late UTC vote on that UTC day across a DST boundary", () => {
    const end = new Date("2026-03-10T15:00:00.000Z");
    const buckets = buildUtcDayBuckets(end, 7);
    addVotesToBuckets(buckets, [
      { createdAt: new Date("2026-03-08T23:30:00.000Z"), voteCount: 4 },
      { createdAt: new Date("2026-03-03T23:59:59.999Z"), voteCount: 9 },
    ]);

    const trend = bucketsToTrend(buckets);
    expect(trend.map((point) => point.date)).toEqual([
      "2026-03-04",
      "2026-03-05",
      "2026-03-06",
      "2026-03-07",
      "2026-03-08",
      "2026-03-09",
      "2026-03-10",
    ]);
    expect(trend.find((point) => point.date === "2026-03-08")?.votes).toBe(4);
    expect(trend.find((point) => point.date === "2026-03-04")?.votes).toBe(0);
    expect(utcDayKey(new Date("2026-03-08T23:30:00.000Z"))).toBe("2026-03-08");
  });
});
