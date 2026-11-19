import { describe, expect, it, vi } from "vitest";
import { fetchUpcomingEvents } from "./calendar-client";

describe("fetchUpcomingEvents", () => {
  it("sends the session token the events endpoint requires", async () => {
    const event = { id: "e1", title: "Dinner", startTime: "", endTime: "", location: "Pune" };
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({ events: [event] }), { status: 200 }));

    await expect(fetchUpcomingEvents("jwt", fetchImpl)).resolves.toEqual([event]);
    expect(fetchImpl).toHaveBeenCalledWith("/api/calendar/events", { headers: { Authorization: "Bearer jwt" } });
  });

  it("returns no events when signed out or rejected", async () => {
    const fetchImpl = vi.fn(async () => new Response("{}", { status: 401 }));
    await expect(fetchUpcomingEvents(null, fetchImpl)).resolves.toEqual([]);
    expect(fetchImpl).toHaveBeenCalledWith("/api/calendar/events", { headers: {} });
  });
});
