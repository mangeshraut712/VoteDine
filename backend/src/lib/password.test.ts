import { describe, expect, it, vi } from "vitest";
import { DUMMY_PASSWORD_HASH, passwordMatches } from "./password.js";

describe("passwordMatches", () => {
  it("compares a missing user against the dummy hash and still rejects", async () => {
    const compare = vi.fn(async () => true);
    await expect(passwordMatches(null, "secret", compare)).resolves.toBe(false);
    expect(compare).toHaveBeenCalledWith("secret", DUMMY_PASSWORD_HASH);
  });

  it("rejects an invalid stored hash without throwing", async () => {
    await expect(passwordMatches("$2b$10$YourHashedPasswordHere", "password")).resolves.toBe(false);
  });

  it("accepts a matching bcrypt hash", async () => {
    const compare = vi.fn(async () => true);
    await expect(passwordMatches(DUMMY_PASSWORD_HASH, "password", compare)).resolves.toBe(true);
    expect(compare).toHaveBeenCalledWith("password", DUMMY_PASSWORD_HASH);
  });
});
