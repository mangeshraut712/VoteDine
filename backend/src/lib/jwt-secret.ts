import { randomBytes } from "node:crypto";

export const MIN_JWT_SECRET_LENGTH = 32;

/** Secrets that were committed as defaults in earlier versions; they are public. */
const KNOWN_COMPROMISED_SECRETS = new Set(["your-super-secret-jwt-key", "your-super-secret-jwt-key-change-in-production"]);

/**
 * Warns that a generated secret is being used. Kept separate from
 * resolveJwtSecret so that the configured value has no path to this log sink.
 */
function warnGeneratedSecret(nodeEnv: string): void {
    // lgtm [js/clear-text-logging] CodeQL[js/clear-text-logging]: false positive.
    // This interpolates only MIN_JWT_SECRET_LENGTH (a constant) and the environment
    // name; the configured secret has no parameter path into this function.
    console.warn(`JWT_SECRET is shorter than ${MIN_JWT_SECRET_LENGTH} characters; using a generated secret for ${nodeEnv}`);
}

/**
 * Resolves the signing secret for a process.
 *
 * Production must configure a strong secret: a committed default would be public,
 * and anyone could mint a token for any user. Development and test get a random
 * secret per process when none is configured, so local setup boots without one.
 */
export function resolveJwtSecret(
  configured: string | undefined,
  nodeEnv: string,
): string {
  const isProduction = nodeEnv === "production";
  const value = configured?.trim() ?? "";

  if (isProduction && KNOWN_COMPROMISED_SECRETS.has(value)) {
    throw new Error("JWT_SECRET is a publicly known default; set a unique secret for production.");
  }

  if (value.length >= MIN_JWT_SECRET_LENGTH) return value;

  if (isProduction) {
    throw new Error(
      `JWT_SECRET must be set to a secret of at least ${MIN_JWT_SECRET_LENGTH} characters in production.`,
    );
  }

  if (value) warnGeneratedSecret(nodeEnv);
  return randomBytes(32).toString("hex");
}
