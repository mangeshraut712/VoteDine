import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MIN_JWT_SECRET_LENGTH, resolveJwtSecret } from "./jwt-secret.js";

const repoRoot = join(process.cwd(), "..");
const strong = "a".repeat(MIN_JWT_SECRET_LENGTH);

describe("JWT secret resolution", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("uses a configured secret that is long enough, verbatim", () => {
        expect(resolveJwtSecret(strong, "production")).toBe(strong);
        expect(resolveJwtSecret(`  ${strong}  `, "development")).toBe(strong);
    });

    it("refuses to start in production without a strong secret", () => {
        for (const configured of [undefined, "", "   "]) {
            expect(() => resolveJwtSecret(configured, "production")).toThrow(/JWT_SECRET must be set/);
        }
        // The old 25-character compose default: too short, and publicly known.
        expect(() => resolveJwtSecret("your-super-secret-jwt-key", "production")).toThrow(/JWT_SECRET/);
    });

    it("refuses the publicly known default even though it is long enough", () => {
        expect(() => resolveJwtSecret("your-super-secret-jwt-key-change-in-production", "production")).toThrow(
            /publicly known default/,
        );
    });

    it("generates a fresh random secret for development and test when none is configured", () => {
        const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
        const first = resolveJwtSecret(undefined, "development");
        const second = resolveJwtSecret(undefined, "test");

        expect(first.length).toBeGreaterThanOrEqual(MIN_JWT_SECRET_LENGTH);
        expect(second.length).toBeGreaterThanOrEqual(MIN_JWT_SECRET_LENGTH);
        // Random per process, so it is never a shared or committed value.
        expect(first).not.toBe(second);
        expect(warn).not.toHaveBeenCalled();

        expect(resolveJwtSecret("too-short", "development").length).toBeGreaterThanOrEqual(MIN_JWT_SECRET_LENGTH);
        expect(warn).toHaveBeenCalledTimes(1);
    });
});

describe("committed configuration never ships a usable signing key", () => {
    function dotenvValue(source: string, key: string): string {
        const match = source.match(new RegExp(`^${key}=("([^"\\n]*)"|([^\\s#][^\\n]*))`, "m"));
        if (!match) return "";
        return match[2] ?? match[3] ?? "";
    }

    it("docker-compose has no public JWT_SECRET fallback", () => {
        const compose = readFileSync(join(repoRoot, "docker-compose.yml"), "utf8");
        const fallback = compose.match(/JWT_SECRET=\$\{JWT_SECRET:-([^}]*)\}/)?.[1];
        // The backend service runs as NODE_ENV=production, so it must be configured explicitly.
        expect(fallback).toBe("");
        expect(() => resolveJwtSecret(fallback, "production")).toThrow(/JWT_SECRET/);
    });

    it("copying .env.example verbatim cannot produce a usable production secret", () => {
        const example = readFileSync(join(repoRoot, ".env.example"), "utf8");
        const documented = dotenvValue(example, "JWT_SECRET");
        // The documented value must be rejected by the real gate, whatever its shape.
        expect(() => resolveJwtSecret(documented, "production")).toThrow(/JWT_SECRET/);
    });
});
