import { apiUrl } from "./api";

export const AUTH_TOKEN_KEY = "votedine.token";

type TokenStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export function readAuthToken(storage: TokenStorage | null): string | null {
  if (!storage) return null;
  try {
    return storage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function saveAuthToken(storage: TokenStorage, token: string): void {
  storage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearAuthToken(storage: TokenStorage): void {
  storage.removeItem(AUTH_TOKEN_KEY);
}

interface AuthPayload {
  success?: boolean;
  message?: string;
  data?: { token?: string };
}

export async function authenticateRequest(
  path: "/api/users/login" | "/api/users/register",
  body: { username: string; password: string },
  fetchImpl: typeof fetch = fetch,
): Promise<{ ok: true; token: string } | { ok: false; message: string }> {
  let response: Response;
  try {
    response = await fetchImpl(apiUrl(path), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    return { ok: false, message: "Could not reach VoteDine. Try again." };
  }

  const payload = (await response.json().catch(() => null)) as AuthPayload | null;
  const token = payload?.data?.token;
  if (!response.ok || !payload?.success || !token) {
    return { ok: false, message: payload?.message || "Request failed" };
  }
  return { ok: true, token };
}
