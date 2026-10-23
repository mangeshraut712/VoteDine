export function utcDayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function buildUtcDayBuckets(endDate: Date, days: number): Map<string, number> {
  const end = new Date(Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate()));
  const start = new Date(end);
  start.setUTCDate(end.getUTCDate() - (days - 1));

  const buckets = new Map<string, number>();
  for (let i = 0; i < days; i += 1) {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + i);
    buckets.set(utcDayKey(date), 0);
  }
  return buckets;
}

export function addVotesToBuckets(
  buckets: Map<string, number>,
  votes: Array<{ createdAt: Date; voteCount: number }>,
): void {
  for (const vote of votes) {
    const key = utcDayKey(vote.createdAt);
    if (!buckets.has(key)) continue;
    buckets.set(key, (buckets.get(key) ?? 0) + vote.voteCount);
  }
}

export function bucketsToTrend(buckets: Map<string, number>): Array<{ date: string; votes: number }> {
  return Array.from(buckets.entries()).map(([date, votes]) => ({ date, votes }));
}
