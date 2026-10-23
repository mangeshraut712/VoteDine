import { describe, expect, it } from "vitest";
import { getAuthUserId } from "./auth-user.js";

describe("getAuthUserId", () => {
  it("returns a positive integer user id", () => {
    expect(getAuthUserId({ userId: 7, id: 1 })).toBe(7);
    expect(getAuthUserId({ id: 4 })).toBe(4);
    expect(getAuthUserId({ userId: "12" })).toBe(12);
  });

  it("does not fall back to a shared user when the token has no id", () => {
    expect(getAuthUserId(undefined)).toBeNull();
    expect(getAuthUserId(null)).toBeNull();
    expect(getAuthUserId({})).toBeNull();
    expect(getAuthUserId({ userId: 0 })).toBeNull();
    expect(getAuthUserId({ userId: -3 })).toBeNull();
    expect(getAuthUserId({ userId: 1.5 })).toBeNull();
    expect(getAuthUserId({ username: "ada" })).toBeNull();
  });
});
