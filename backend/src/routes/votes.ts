import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";

const voteSchema = z.object({
  restaurantId: z.number(),
  roomId: z.string().optional(),
  increment: z.number().min(-1).max(1).default(1),
});

export async function voteRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions
) {
  // Cast vote
  fastify.post("/", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { restaurantId, roomId, increment } = voteSchema.parse(request.body);

      const vote = await fastify.prisma.vote.upsert({
        where: {
          userId_restaurantId_roomId: {
            userId: 1, // TODO: Get from auth context
            restaurantId,
            roomId: roomId || null,
          },
        },
        update: {
          voteCount: {
            increment: increment,
          },
        },
        create: {
          userId: 1, // TODO: Get from auth context
          restaurantId,
          roomId: roomId || null,
          voteCount: Math.max(0, increment),
        },
      });

      return reply.send({
        success: true,
        data: vote,
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
  });

  // Get user's votes
  fastify.get("/my-votes", async (_request: FastifyRequest, reply: FastifyReply) => {
    const votes = await fastify.prisma.vote.findMany({
      where: {
        userId: 1, // TODO: Get from auth context
      },
      include: {
        restaurant: true,
      },
      orderBy: {
        voteCount: "desc",
      },
    });

    return reply.send({
      success: true,
      data: votes,
    });
  });

  // Get room votes
  fastify.get("/room/:roomId", async (request: FastifyRequest, reply: FastifyReply) => {
    const { roomId } = request.params as { roomId: string };

    const votes = await fastify.prisma.vote.groupBy({
      by: ["restaurantId"],
      where: { roomId },
      _sum: {
        voteCount: true,
      },
    });

    return reply.send({
      success: true,
      data: votes,
    });
  });

  // Get leaderboard
  fastify.get("/leaderboard", async (request: FastifyRequest, reply: FastifyReply) => {
    const { roomId, limit = 10 } = request.query as { roomId?: string; limit?: string };

    const where = roomId ? { roomId } : { roomId: null };

    const votes = await fastify.prisma.vote.groupBy({
      by: ["restaurantId"],
      where,
      _sum: {
        voteCount: true,
      },
      orderBy: {
        _sum: {
          voteCount: "desc",
        },
      },
      take: parseInt(limit.toString()),
    });

    const restaurantIds = votes.map((v) => v.restaurantId);
    const restaurants = await fastify.prisma.restaurant.findMany({
      where: {
        id: {
          in: restaurantIds,
        },
      },
    });

    const leaderboard = votes.map((vote) => ({
      restaurant: restaurants.find((r) => r.id === vote.restaurantId),
      votes: vote._sum?.voteCount,
    }));

    return reply.send({
      success: true,
      data: leaderboard,
    });
  });
}
