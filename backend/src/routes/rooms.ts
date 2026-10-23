import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { getAuthUserId } from "../lib/auth-user.js";
import { prismaErrorCode } from "../lib/errors.js";
import { withUniqueRoomCode } from "../lib/room-code.js";
import { roomVoteTotal } from "../lib/votes.js";
import { authenticate } from "../middleware/authenticate.js";

const roomCodeSchema = z.string().regex(/^[A-Za-z0-9]{8}$/);

const createRoomSchema = z.object({
  name: z.string().trim().min(1).max(100),
  cuisine: z.string().trim().max(50).optional(),
  priceRange: z.string().trim().max(10).optional(),
  latitude: z.number().finite().min(-90).max(90).optional(),
  longitude: z.number().finite().min(-180).max(180).optional(),
  radius: z.number().int().min(100).max(50000).optional(),
});

export const joinRoomBodySchema = z.object({
  guestName: z.string().trim().min(1).max(50).optional(),
});

async function authenticatedUserId(request: FastifyRequest, reply: FastifyReply): Promise<number | null | undefined> {
  if (!request.headers.authorization) return null;
  try {
    await request.jwtVerify();
  } catch {
    reply.status(401).send({ success: false, message: "Unauthorized" });
    return undefined;
  }
  const userId = getAuthUserId(request.user);
  if (userId === null) {
    reply.status(401).send({ success: false, message: "Unauthorized" });
    return undefined;
  }
  return userId;
}

export async function roomRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions
) {
  fastify.post("/", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = createRoomSchema.parse(request.body);
      const hostUserId = await authenticatedUserId(request, reply);
      if (hostUserId === undefined) return;

      const room = await withUniqueRoomCode((code) =>
        fastify.prisma.room.create({
          data: {
            name: data.name,
            cuisine: data.cuisine,
            priceRange: data.priceRange,
            latitude: data.latitude,
            longitude: data.longitude,
            radius: data.radius,
            code,
            members: hostUserId
              ? { create: [{ userId: hostUserId, isHost: true }] }
              : undefined,
          },
          include: {
            members: true,
            roomRestaurants: {
              include: { restaurant: true },
            },
          },
        }),
      );

      return reply.status(201).send({
        success: true,
        data: room,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          success: false,
          message: "Invalid input",
          errors: error.issues,
        });
      }
      throw error;
    }
  });

  fastify.get("/:code", async (request: FastifyRequest, reply: FastifyReply) => {
    const params = z.object({ code: roomCodeSchema }).safeParse(request.params);
    if (!params.success) {
      return reply.status(400).send({ success: false, message: "Invalid room code" });
    }

    const room = await fastify.prisma.room.findUnique({
      where: { code: params.data.code.toUpperCase() },
      include: {
        members: {
          include: {
            user: { select: { id: true, username: true } },
          },
        },
        roomRestaurants: {
          include: {
            restaurant: {
              include: {
                votes: { select: { roomId: true, voteCount: true } },
              },
            },
          },
        },
        messages: {
          take: 50,
          orderBy: { createdAt: "desc" },
          include: {
            user: { select: { id: true, username: true } },
          },
        },
      },
    });

    if (!room) {
      return reply.status(404).send({
        success: false,
        message: "Room not found",
      });
    }

    return reply.send({
      success: true,
      data: {
        ...room,
        roomRestaurants: room.roomRestaurants.map((entry) => ({
          ...entry,
          restaurant: {
            ...entry.restaurant,
            votes: entry.restaurant.votes.filter((vote) => vote.roomId === room.id),
            voteCount: roomVoteTotal(entry.restaurant.votes, room.id),
          },
        })),
      },
    });
  });

  fastify.post("/:code/join", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const params = z.object({ code: roomCodeSchema }).parse(request.params);
      const { guestName } = joinRoomBodySchema.parse(request.body ?? {});
      const userId = await authenticatedUserId(request, reply);
      if (userId === undefined) return;

      const room = await fastify.prisma.room.findUnique({
        where: { code: params.code.toUpperCase() },
      });

      if (!room) {
        return reply.status(404).send({
          success: false,
          message: "Room not found",
        });
      }

      if (!room.isActive) {
        return reply.status(400).send({
          success: false,
          message: "Room is no longer active",
        });
      }

      const member = await fastify.prisma.roomMember.create({
        data: {
          roomId: room.id,
          userId: userId ?? undefined,
          guestName,
        },
        include: {
          user: { select: { id: true, username: true } },
        },
      });

      return reply.send({
        success: true,
        data: member,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          success: false,
          message: "Invalid input",
          errors: error.issues,
        });
      }
      if (prismaErrorCode(error) === "P2002") {
        return reply.status(409).send({
          success: false,
          message: "Already joined this room",
        });
      }
      throw error;
    }
  });

  fastify.patch("/:code/close", { preHandler: [authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const params = z.object({ code: roomCodeSchema }).safeParse(request.params);
    if (!params.success) {
      return reply.status(400).send({ success: false, message: "Invalid room code" });
    }
    const userId = getAuthUserId(request.user);
    if (userId === null) {
      return reply.status(401).send({ success: false, message: "Unauthorized" });
    }

    const room = await fastify.prisma.room.findUnique({
      where: { code: params.data.code.toUpperCase() },
    });
    if (!room) {
      return reply.status(404).send({ success: false, message: "Room not found" });
    }

    const host = await fastify.prisma.roomMember.findFirst({
      where: { roomId: room.id, userId, isHost: true },
    });
    if (!host) {
      return reply.status(403).send({ success: false, message: "Only the host can close this room" });
    }

    const updated = await fastify.prisma.room.update({
      where: { id: room.id },
      data: { isActive: false },
    });

    return reply.send({
      success: true,
      data: updated,
    });
  });
}
