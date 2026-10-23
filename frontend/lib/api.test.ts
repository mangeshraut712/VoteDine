import { describe, expect, it } from "vitest";
import { apiUrl } from "./api";

describe("apiUrl", () => {
  it("uses a same-origin path when the public API URL is unset", () => {
    expect(apiUrl("/api/analytics/overview", undefined)).toBe("/api/analytics/overview");
    expect(apiUrl("api/recommendations", "")).toBe("/api/recommendations");
  });

  it("joins an absolute API origin without a double slash", () => {
    expect(apiUrl("/api/recommendations", "http://localhost:3001/")).toBe("http://localhost:3001/api/recommendations");
  });
});
