import { describe, expect, it } from "vitest";
import { leaderboardQuerySchema, resolveVoteWrite, roomVoteTotal } from "./votes.js";

describe("vote totals", () => {
  it("floors a vote at zero and rejects a downvote with no existing vote", () => {
    expect(resolveVoteWrite(0, -1)).toEqual({ ok: true, voteCount: 0 });
    expect(resolveVoteWrite(2, 1)).toEqual({ ok: true, voteCount: 3 });
    expect(resolveVoteWrite(null, -1).ok).toBe(false);
    expect(resolveVoteWrite(1, 0).ok).toBe(false);
  });

  it("sums only the votes that belong to the room", () => {
    expect(roomVoteTotal([
      { roomId: "room-a", voteCount: 4 },
      { roomId: "room-b", voteCount: 9 },
      { roomId: "room-a", voteCount: 1 },
    ], "room-a")).toBe(5);
  });

  it("rejects unbounded or non-numeric leaderboard limits", () => {
    expect(leaderboardQuerySchema.parse({}).limit).toBe(10);
    expect(leaderboardQuerySchema.parse({ limit: "25" }).limit).toBe(25);
    expect(() => leaderboardQuerySchema.parse({ limit: "100000" })).toThrow();
    expect(() => leaderboardQuerySchema.parse({ limit: "nope" })).toThrow();
  });
});
