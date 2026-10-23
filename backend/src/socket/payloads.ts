import { z } from "zod";

export const roomKeySchema = z.string().trim().regex(/^[A-Za-z0-9-]{1,36}$/);

export const votePayloadSchema = z.object({
  roomId: roomKeySchema,
  restaurantId: z.number().int().positive(),
  increment: z.number().int().min(-1).max(1).default(1),
});

export const messagePayloadSchema = z.object({
  roomId: roomKeySchema,
  content: z.string().trim().min(1).max(500),
  guestName: z.string().trim().min(1).max(50).optional(),
});

export const addRestaurantPayloadSchema = z
  .object({
    roomId: roomKeySchema,
    restaurantId: z.number().int().positive().optional(),
    name: z.string().trim().min(1).max(100).optional(),
  })
  .refine((value) => value.restaurantId !== undefined || (value.name !== undefined && value.name.length > 0), {
    message: "A restaurant id or name is required",
  });

export const MAX_VOICE_AUDIO_CHARS = 500_000;

export function isAcceptableAudioPayload(audio: string): boolean {
  return audio.length > 0 && audio.length <= MAX_VOICE_AUDIO_CHARS;
}
