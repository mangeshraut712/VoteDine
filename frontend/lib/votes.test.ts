import { describe, expect, it } from "vitest";
import { nextVoteTotal, sumVoteCount } from "./votes";

describe("room vote display", () => {
  it("sums vote counts instead of counting rows", () => {
    expect(sumVoteCount([{ voteCount: 4 }, { voteCount: 1 }])).toBe(5);
    expect(sumVoteCount([{ voteCount: 4 }], 9)).toBe(9);
  });

  it("does not let a downvote go below zero", () => {
    expect(nextVoteTotal(0, false)).toBe(0);
    expect(nextVoteTotal(2, false)).toBe(1);
  });
});
