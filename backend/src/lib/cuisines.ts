export function topCuisineByVotes(
  rows: Array<{ cuisine: string | null | undefined; votes: number }>,
): string {
  const totals = new Map<string, number>();
  for (const row of rows) {
    const cuisine = row.cuisine?.trim();
    if (!cuisine) continue;
    if (!Number.isFinite(row.votes) || row.votes <= 0) continue;
    totals.set(cuisine, (totals.get(cuisine) ?? 0) + row.votes);
  }

  let best = "Mixed";
  let bestVotes = 0;
  for (const [cuisine, votes] of totals) {
    if (votes > bestVotes) {
      best = cuisine;
      bestVotes = votes;
    }
  }
  return best;
}
