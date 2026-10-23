import { describe, expect, it } from "vitest";
import { toRecommendationId } from "./recommendations";

describe("toRecommendationId", () => {
  it("keeps positive integer ids and does not invent a random one", () => {
    expect(toRecommendationId("12")).toBe(12);
    expect(toRecommendationId("0")).toBeNull();
    expect(toRecommendationId("12abc")).toBeNull();
  });
});
