export function sumVoteCount(
  votes: Array<{ voteCount?: number }> | undefined,
  explicitTotal?: number,
): number {
  if (typeof explicitTotal === "number" && Number.isFinite(explicitTotal)) {
    return Math.max(0, explicitTotal);
  }
  if (!votes) return 0;
  return votes.reduce((sum, vote) => sum + Math.max(0, vote.voteCount ?? 0), 0);
}

export function nextVoteTotal(current: number, upvote: boolean): number {
  return Math.max(0, current + (upvote ? 1 : -1));
}
