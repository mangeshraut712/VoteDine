import bcrypt from "bcryptjs";

type CompareFn = (password: string, hash: string) => Promise<boolean>;

/** Valid bcrypt hash used only so missing users take the same compare path. */
export const DUMMY_PASSWORD_HASH = bcrypt.hashSync("votedine-invalid-password", 10);

function isBcryptHash(value: string | null | undefined): value is string {
  return typeof value === "string" && /^\$2[aby]\$\d{2}\$/.test(value);
}

/**
 * Compare a password without revealing whether the account exists and without
 * throwing when a stored hash is not a real bcrypt string.
 */
export async function passwordMatches(
  storedHash: string | null | undefined,
  password: string,
  compare: CompareFn = bcrypt.compare,
): Promise<boolean> {
  const usable = isBcryptHash(storedHash);
  const hash = usable ? storedHash : DUMMY_PASSWORD_HASH;
  let matches = false;
  try {
    matches = await compare(password, hash);
  } catch {
    matches = false;
  }
  return usable && matches;
}
