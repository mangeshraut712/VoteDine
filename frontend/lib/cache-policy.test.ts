import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { isCacheableRequest, offlineFallbackUrl, precacheUrls, shouldStoreResponse } from "./cache-policy";
import { generateRoomId } from "./utils";

describe("service worker cache policy", () => {
  it("does not cache API calls, other origins, or failed responses", () => {
    expect(isCacheableRequest({
      method: "GET",
      url: "https://user.github.io/VoteDine/api/rooms",
      pageOrigin: "https://user.github.io",
    })).toBe(false);
    expect(isCacheableRequest({
      method: "GET",
      url: "https://cdn.example/app.js",
      pageOrigin: "https://user.github.io",
    })).toBe(false);
    expect(isCacheableRequest({
      method: "GET",
      url: "https://user.github.io/VoteDine/rooms",
      pageOrigin: "https://user.github.io",
    })).toBe(true);
    expect(shouldStoreResponse(500, "basic")).toBe(false);
    expect(shouldStoreResponse(200, "opaque")).toBe(false);
  });

  it("precaches from the service worker directory and only falls back for navigations", () => {
    const worker = "https://user.github.io/VoteDine/sw.js";
    expect(precacheUrls(worker)).toContain("https://user.github.io/VoteDine/manifest.webmanifest");
    expect(offlineFallbackUrl("navigate", worker)).toBe("https://user.github.io/VoteDine/");
    expect(offlineFallbackUrl("cors", worker)).toBeNull();
  });

  it("keeps the published worker on the same rules", () => {
    const source = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../public/sw.js"), "utf8");
    expect(source).toContain('includes("api")');
    expect(source).toContain("response.ok");
    expect(source).not.toContain('caches.match("/")');
    expect(source).toContain('new URL("./", self.location.href)');
  });
});

describe("generateRoomId", () => {
  it("returns a fixed-length code", () => {
    expect(generateRoomId()).toMatch(/^[A-F0-9]{8}$/);
  });
});
