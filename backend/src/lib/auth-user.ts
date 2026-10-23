export interface AuthPayload {
  userId?: unknown;
  id?: unknown;
  username?: unknown;
}

/**
 * Read the authenticated user id from a JWT payload.
 * Never falls back to a shared user: missing or invalid ids are unauthenticated.
 */
export function getAuthUserId(user: AuthPayload | null | undefined): number | null {
  if (!user) return null;
  const raw = user.userId ?? user.id;
  const id = typeof raw === "number" ? raw : typeof raw === "string" ? Number(raw) : Number.NaN;
  if (!Number.isInteger(id) || id <= 0) return null;
  return id;
}
