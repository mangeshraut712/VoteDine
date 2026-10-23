import { randomBytes } from "crypto";
import { prismaErrorCode } from "./errors.js";

const ROOM_CODE_ATTEMPTS = 5;

export function createRoomCode(): string {
  return randomBytes(4).toString("hex").toUpperCase();
}

export function roomLookupFilter(roomKey: string): { OR: Array<{ id: string } | { code: string }> } {
  return {
    OR: [{ id: roomKey }, { code: roomKey.toUpperCase() }],
  };
}

export async function withUniqueRoomCode<T>(
  create: (code: string) => Promise<T>,
  attempts = ROOM_CODE_ATTEMPTS,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await create(createRoomCode());
    } catch (error) {
      if (prismaErrorCode(error) !== "P2002") throw error;
      lastError = error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Could not allocate a room code");
}
