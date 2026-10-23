export function toRecommendationId(id: string): number | null {
  if (!/^[1-9]\d*$/.test(id)) return null;
  const value = Number(id);
  return Number.isSafeInteger(value) ? value : null;
}
