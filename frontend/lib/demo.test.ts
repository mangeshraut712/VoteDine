import { describe, expect, it } from "vitest";
import {
  DEMO_ROOM_ID,
  demoAnalytics,
  demoRecommendations,
  demoRoom,
} from "./demo";

describe("demo catalog", () => {
  it("exposes a stable demo room id for static Pages export", () => {
    expect(DEMO_ROOM_ID).toBe("demo");
    expect(demoRoom.code).toBe(DEMO_ROOM_ID);
    expect(demoRoom.restaurants.length).toBeGreaterThan(0);
  });

  it("includes recommendation and analytics samples for demo mode", () => {
    expect(demoRecommendations.length).toBeGreaterThan(0);
    expect(demoAnalytics.totalVotes).toBeGreaterThan(0);
    expect(demoAnalytics.votingTrends.length).toBe(7);
  });
});
