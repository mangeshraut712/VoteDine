export const MIN_JWT_SECRET_LENGTH = 32;

/** Fallback inside docker-compose `JWT_SECRET=${JWT_SECRET:-...}`. */
export function composeJwtFallback(source: string): string | null {
  const match = source.match(/JWT_SECRET=\$\{JWT_SECRET:-([^}\s]+)\}/);
  return match?.[1] ?? null;
}

/** Value of a dotenv `JWT_SECRET=` line, without surrounding quotes. */
export function dotenvJwtSecret(source: string): string | null {
  const match = source.match(/^JWT_SECRET=["']?([^"'\n]+)["']?/m);
  return match?.[1] ?? null;
}
