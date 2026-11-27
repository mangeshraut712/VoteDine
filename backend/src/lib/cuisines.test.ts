import { describe, expect, it } from "vitest";
import { topCuisineByVotes } from "./cuisines.js";

describe("topCuisineByVotes", () => {
  it("ranks by vote total, not by how many restaurants share a cuisine", () => {
    expect(topCuisineByVotes([
      { cuisine: "Italian", votes: 1 },
      { cuisine: "Italian", votes: 1 },
      { cuisine: "Italian", votes: 1 },
      { cuisine: "Mexican", votes: 4 },
    ])).toBe("Mexican");
  });

  it("ignores blank cuisines and non-positive totals", () => {
    expect(topCuisineByVotes([
      { cuisine: null, votes: 20 },
      { cuisine: "  ", votes: 9 },
      { cuisine: "Thai", votes: 0 },
      { cuisine: "Thai", votes: 2 },
    ])).toBe("Thai");
  });

  it("falls back when nothing has been voted", () => {
    expect(topCuisineByVotes([])).toBe("Mixed");
  });
});
