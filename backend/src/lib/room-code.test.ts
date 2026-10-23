import { describe, expect, it } from "vitest";
import { createRoomCode, withUniqueRoomCode } from "./room-code.js";

describe("room codes", () => {
  it("always returns 8 hexadecimal characters", () => {
    for (let i = 0; i < 20; i += 1) {
      expect(createRoomCode()).toMatch(/^[A-F0-9]{8}$/);
    }
  });

  it("retries when the code is already taken", async () => {
    let calls = 0;
    const room = await withUniqueRoomCode(async (code) => {
      calls += 1;
      if (calls === 1) {
        throw { name: "PrismaClientKnownRequestError", code: "P2002", message: "taken" };
      }
      return { code };
    });
    expect(calls).toBe(2);
    expect(room.code).toMatch(/^[A-F0-9]{8}$/);
  });
});
