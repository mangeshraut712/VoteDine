import { describe, expect, it, vi } from "vitest";
import { AUTH_TOKEN_KEY, authenticateRequest, readAuthToken, saveAuthToken } from "./auth-client";

describe("authenticateRequest", () => {
  it("returns the API error message and stores a successful token", async () => {
    const denied = await authenticateRequest("/api/users/login", { username: "ada", password: "nope" }, vi.fn(async () => new Response(JSON.stringify({ success: false, message: "Invalid credentials" }), { status: 401 })));
    expect(denied).toEqual({ ok: false, message: "Invalid credentials" });

    const accepted = await authenticateRequest("/api/users/login", { username: "ada", password: "secret" }, vi.fn(async () => new Response(JSON.stringify({ success: true, data: { token: "jwt" } }), { status: 200 })));
    expect(accepted).toEqual({ ok: true, token: "jwt" });

    const storage = { getItem: vi.fn(() => "jwt"), setItem: vi.fn(), removeItem: vi.fn() };
    if (accepted.ok) saveAuthToken(storage, accepted.token);
    expect(storage.setItem).toHaveBeenCalledWith(AUTH_TOKEN_KEY, "jwt");
    expect(readAuthToken(storage)).toBe("jwt");
  });
});
