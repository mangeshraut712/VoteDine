import Fastify from "fastify";
import { afterEach, describe, expect, it } from "vitest";
import { securityHeaders } from "./security.js";

describe("security headers onSend hook", () => {
  const previousNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = previousNodeEnv;
  });

  it("returns the route body with the security headers", async () => {
    process.env.NODE_ENV = "test";
    const app = Fastify({ logger: false });
    app.addHook("onSend", securityHeaders);
    app.get("/health", async () => ({ status: "ok" }));

    const response = await app.inject({ method: "GET", url: "/health" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: "ok" });
    expect(response.headers["x-frame-options"]).toBe("DENY");
    expect(response.headers["content-security-policy"]).toBe("frame-ancestors 'none'");
    expect(response.headers["x-content-type-options"]).toBe("nosniff");
    expect(response.headers["x-xss-protection"]).toBe("1; mode=block");
    expect(response.headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(response.headers["permissions-policy"]).toBe("geolocation=(), microphone=(), camera=()");
    expect(response.headers["strict-transport-security"]).toBeUndefined();
    await app.close();
  });

  it("adds HSTS when NODE_ENV is production", async () => {
    process.env.NODE_ENV = "production";
    const app = Fastify({ logger: false });
    app.addHook("onSend", securityHeaders);
    app.get("/health", async () => ({ status: "ok" }));

    const response = await app.inject({ method: "GET", url: "/health" });

    expect(response.statusCode).toBe(200);
    expect(response.headers["strict-transport-security"]).toBe("max-age=31536000; includeSubDomains");
    await app.close();
  });
});
