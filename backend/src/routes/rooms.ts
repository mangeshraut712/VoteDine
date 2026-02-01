import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

interface CreateRoomBody {
  name: string;
  cuisine?: string;
  priceRange?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
}

interface JoinRoomBody {
  guestName?: string;
}

const createRoomSchema = z.object({
  name: z.string().min(1).max(100),
  cuisine: z.string().optional(),
  priceRange: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  radius: z.number().min(100).max(50000).optional(),
});

const joinRoomSchema = z.object({
  code: z.string().length(8),
  guestName: z.string().min(1).max(50).optional(),
});

export async function roomRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions
) {
  // Create new room
  fastify.post<{ Body: CreateRoomBody }>(
    "/",
    async (request: FastifyRequest<{ Body: CreateRoomBody }>, reply: FastifyReply) => {
      try {
        const data = createRoomSchema.parse(request.body);

        // Generate a unique 8-character room code
        const code = uuidv4().substring(0, 8).toUpperCase();

        const room = await fastify.prisma.room.create({
          data: {
            name: data.name,
            cuisine: data.cuisine,
            priceRange: data.priceRange,
            latitude: data.latitude,
            longitude: data.longitude,
            radius: data.radius,
            code,
          },
          include: {
            members: true,
            roomRestaurants: {
              include: {
                restaurant: true,
              },
            },
          },
        });

        return reply.status(201).send({
          success: true,
          data: room,
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply.status(400).send({
            success: false,
            message: "Invalid input",
            errors: error.errors,
          });
        }
        throw error;
      }
    }
  );

  // Get room by code
  fastify.get<{ Params: { code: string } }>(
    "/:code",
    async (request: FastifyRequest<{ Params: { code: string } }>, reply: FastifyReply) => {
      const { code } = request.params;

      const room = await fastify.prisma.room.findUnique({
        where: { code: code.toUpperCase() },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                },
              },
            },
          },
          roomRestaurants: {
            include: {
              restaurant: {
                include: {
                  votes: true,
                },
              },
            },
          },
          messages: {
            take: 50,
            orderBy: {
              createdAt: "desc",
            },
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                },
              },
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
        data: room,
      });
    }
  );

  // Join room
  fastify.post<{ Params: { code: string }; Body: JoinRoomBody }>(
    "/:code/join",
    async (
      request: FastifyRequest<{ Params: { code: string }; Body: JoinRoomBody }>,
      reply: FastifyReply
    ) => {
      try {
        const { code } = request.params;
        const { guestName } = joinRoomSchema.parse(request.body);

        const room = await fastify.prisma.room.findUnique({
          where: { code: code.toUpperCase() },
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

        // Add member to room
        const member = await fastify.prisma.roomMember.create({
          data: {
            roomId: room.id,
            guestName,
          },
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
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
            errors: error.errors,
          });
        }
        throw error;
      }
    }
  );

  // Close room
  fastify.patch<{ Params: { code: string } }>(
    "/:code/close",
    async (request: FastifyRequest<{ Params: { code: string } }>, reply: FastifyReply) => {
      const { code } = request.params;

      const room = await fastify.prisma.room.update({
        where: { code: code.toUpperCase() },
        data: { isActive: false },
      });

      return reply.send({
        success: true,
        data: room,
      });
    }
  );
}
