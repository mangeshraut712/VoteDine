import { describe, expect, it } from "vitest";
import { addRestaurantPayloadSchema, isAcceptableAudioPayload, messagePayloadSchema, votePayloadSchema } from "./payloads.js";

describe("socket payloads", () => {
  it("ignores a client-supplied user id on votes", () => {
    const parsed = votePayloadSchema.parse({
      roomId: "FRIDAY01",
      restaurantId: 3,
      userId: 1,
      increment: -1,
    });
    expect(parsed).toEqual({ roomId: "FRIDAY01", restaurantId: 3, increment: -1 });
    expect("userId" in parsed).toBe(false);
  });

  it("rejects empty messages and accepts a typed restaurant name", () => {
    expect(messagePayloadSchema.safeParse({ roomId: "FRIDAY01", content: "   " }).success).toBe(false);
    expect(addRestaurantPayloadSchema.safeParse({ roomId: "FRIDAY01", name: "Harbor Ramen" }).success).toBe(true);
    expect(addRestaurantPayloadSchema.safeParse({ roomId: "FRIDAY01" }).success).toBe(false);
  });

  it("rejects oversized voice audio", () => {
    expect(isAcceptableAudioPayload("a")).toBe(true);
    expect(isAcceptableAudioPayload("")).toBe(false);
    expect(isAcceptableAudioPayload("a".repeat(500_001))).toBe(false);
  });
});
