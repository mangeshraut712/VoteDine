export function formatUtcWeekday(dateKey: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey);
  if (!match) return dateKey;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return dateKey;
  const date = new Date(Date.UTC(year, month - 1, day));
  return new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "UTC" }).format(date);
}

export function barHeightPercent(value: number, max: number): number {
  if (!Number.isFinite(value) || !Number.isFinite(max) || max <= 0) return 0;
  return Math.max(0, Math.min(100, (value / max) * 100));
}

export function trendPercentChange(votes: number[]): number | null {
  if (votes.length < 2) return null;
  const half = Math.floor(votes.length / 2);
  const previous = votes.slice(0, half).reduce((sum, value) => sum + value, 0);
  const recent = votes.slice(half).reduce((sum, value) => sum + value, 0);
  if (previous === 0) return recent === 0 ? 0 : null;
  return Math.round(((recent - previous) / previous) * 100);
}
