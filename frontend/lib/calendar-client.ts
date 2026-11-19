export interface UpcomingEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  location: string;
}

/** GET /api/calendar/events requires a Bearer token; send the session token when there is one. */
export async function fetchUpcomingEvents(
  token: string | null,
  fetchImpl: typeof fetch = fetch,
): Promise<UpcomingEvent[]> {
  const response = await fetchImpl("/api/calendar/events", {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) return [];
  const data = (await response.json().catch(() => null)) as { events?: UpcomingEvent[] } | null;
  return data?.events || [];
}
