import { describe, expect, it } from "vitest";
import { isSafeHttpUrl, sanitizeShareText } from "./safe-url.js";

describe("share URL safety", () => {
  it("allows http(s) and rejects scriptable or relative URLs", () => {
    expect(isSafeHttpUrl("https://votedine.example/rooms/ABCD1234")).toBe(true);
    expect(isSafeHttpUrl("javascript:alert(1)")).toBe(false);
    expect(isSafeHttpUrl("/rooms/ABCD1234")).toBe(false);
    expect(isSafeHttpUrl("data:text/html,hi")).toBe(false);
  });

  it("strips header-breaking newlines from share text", () => {
    expect(sanitizeShareText("Hello\r\nBcc: bob@evil.example")).toBe("Hello Bcc: bob@evil.example");
  });
});
