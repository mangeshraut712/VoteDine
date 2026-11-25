import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { MIN_JWT_SECRET_LENGTH, composeJwtFallback, dotenvJwtSecret } from "./jwt-secret.js";

const repoRoot = join(process.cwd(), "..");

describe("JWT secret defaults", () => {
  it("rejects the old 25-character compose fallback", () => {
    expect("your-super-secret-jwt-key".length).toBeLessThan(MIN_JWT_SECRET_LENGTH);
  });

  it("keeps the compose fallback and .env.example long enough to boot", () => {
    const compose = readFileSync(join(repoRoot, "docker-compose.yml"), "utf8");
    const example = readFileSync(join(repoRoot, ".env.example"), "utf8");
    const fallback = composeJwtFallback(compose);
    const documented = dotenvJwtSecret(example);
    expect(fallback).toBe("your-super-secret-jwt-key-change-in-production");
    expect(documented).toBe(fallback);
    expect((fallback ?? "").length).toBeGreaterThanOrEqual(MIN_JWT_SECRET_LENGTH);
  });
});
