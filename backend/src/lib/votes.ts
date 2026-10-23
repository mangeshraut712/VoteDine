import { z } from "zod";

export function resolveVoteWrite(
  existingCount: number | null,
  increment: number,
): { ok: true; voteCount: number } | { ok: false; message: string } {
  if (!Number.isInteger(increment) || increment < -1 || increment > 1 || increment === 0) {
    return { ok: false, message: "Invalid vote increment" };
  }
  if (existingCount === null) {
    if (increment < 0) return { ok: false, message: "No vote to remove" };
    return { ok: true, voteCount: increment };
  }
  return { ok: true, voteCount: Math.max(0, existingCount + increment) };
}

export function roomVoteTotal(
  votes: Array<{ roomId?: string | null; voteCount?: number }>,
  roomId: string,
): number {
  return votes.reduce((sum, vote) => {
    if (vote.roomId !== roomId) return sum;
    const count = vote.voteCount ?? 0;
    return sum + (count > 0 ? count : 0);
  }, 0);
}

export const leaderboardQuerySchema = z.object({
  roomId: z.string().uuid().optional(),
  limit: z.preprocess((value) => {
    if (value === undefined || value === "") return 10;
    if (typeof value === "number" || typeof value === "string") return Number(value);
    return value;
  }, z.number().int().min(1).max(50)),
});

export const voteBodySchema = z.object({
  restaurantId: z.number().int().positive(),
  roomId: z.string().uuid().optional(),
  increment: z.number().int().min(-1).max(1).default(1),
});
