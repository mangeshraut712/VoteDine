export function parseRestaurantId(value: string): number | null {
  if (!/^[1-9]\d*$/.test(value)) return null;
  const id = Number(value);
  if (!Number.isSafeInteger(id)) return null;
  return id;
}

/** Log-safe summary that never copies request headers or the API key. */
export function yelpErrorSummary(error: unknown): { message: string; status?: number } {
  if (typeof error !== "object" || error === null) {
    return { message: "Yelp request failed" };
  }
  const record = error as { message?: unknown; response?: { status?: unknown } };
  const message = typeof record.message === "string" ? record.message : "Yelp request failed";
  const status = typeof record.response?.status === "number" ? record.response.status : undefined;
  return status === undefined ? { message } : { message, status };
}
