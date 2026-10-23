import { describe, expect, it } from "vitest";
import { parseRestaurantId, yelpErrorSummary } from "./ids.js";

describe("restaurant ids", () => {
  it("rejects partial numeric strings that parseInt would accept", () => {
    expect(parseRestaurantId("15")).toBe(15);
    expect(parseRestaurantId("15abc")).toBeNull();
    expect(parseRestaurantId("0")).toBeNull();
    expect(parseRestaurantId("-3")).toBeNull();
  });
});

describe("yelpErrorSummary", () => {
  it("does not include request headers", () => {
    const summary = yelpErrorSummary({
      message: "Request failed with status code 401",
      response: { status: 401 },
      config: { headers: { Authorization: "Bearer yelp-secret" } },
    });
    expect(summary).toEqual({ message: "Request failed with status code 401", status: 401 });
    expect(JSON.stringify(summary)).not.toContain("yelp-secret");
  });
});
