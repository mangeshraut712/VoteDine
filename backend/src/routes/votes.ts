import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { getAuthUserId } from "../lib/auth-user.js";
import { leaderboardQuerySchema, resolveVoteWrite, voteBodySchema } from "../lib/votes.js";
import { authenticate } from "../middleware/authenticate.js";

export async function voteRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions
) {
  fastify.post("/", { preHandler: [authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { restaurantId, roomId, increment } = voteBodySchema.parse(request.body);
      const userId = getAuthUserId(request.user);
      if (userId === null) {
        return reply.status(401).send({ success: false, message: "Unauthorized" });
      }

      const existing = await fastify.prisma.vote.findFirst({
        where: {
          userId,
          restaurantId,
          roomId: roomId ?? null,
        },
      });

      const decision = resolveVoteWrite(existing?.voteCount ?? null, increment);
      if (decision.ok === false) {
        return reply.status(400).send({ success: false, message: decision.message });
      }

      const vote = existing
        ? await fastify.prisma.vote.update({
            where: { id: existing.id },
            data: { voteCount: decision.voteCount },
          })
        : await fastify.prisma.vote.create({
            data: {
              userId,
              restaurantId,
              roomId: roomId ?? null,
              voteCount: decision.voteCount,
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
          errors: error.issues,
        });
      }
      throw error;
    }
  });

  fastify.get("/my-votes", { preHandler: [authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = getAuthUserId(request.user);
    if (userId === null) {
      return reply.status(401).send({ success: false, message: "Unauthorized" });
    }

    const votes = await fastify.prisma.vote.findMany({
      where: { userId },
      include: { restaurant: true },
      orderBy: { voteCount: "desc" },
    });

    return reply.send({
      success: true,
      data: votes,
    });
  });

  fastify.get("/room/:roomId", async (request: FastifyRequest, reply: FastifyReply) => {
    const params = z.object({ roomId: z.string().uuid() }).safeParse(request.params);
    if (!params.success) {
      return reply.status(400).send({ success: false, message: "Invalid room id" });
    }

    const votes = await fastify.prisma.vote.groupBy({
      by: ["restaurantId"],
      where: { roomId: params.data.roomId },
      _sum: { voteCount: true },
    });

    return reply.send({
      success: true,
      data: votes,
    });
  });

  fastify.get("/leaderboard", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { roomId, limit } = leaderboardQuerySchema.parse(request.query);
      const where = roomId ? { roomId } : { roomId: null };

      const votes = await fastify.prisma.vote.groupBy({
        by: ["restaurantId"],
        where,
        _sum: { voteCount: true },
        orderBy: { _sum: { voteCount: "desc" } },
        take: limit,
      });

      const restaurantIds = votes.map((vote) => vote.restaurantId);
      const restaurants = await fastify.prisma.restaurant.findMany({
        where: { id: { in: restaurantIds } },
      });

      const leaderboard = votes.map((vote) => ({
        restaurant: restaurants.find((restaurant) => restaurant.id === vote.restaurantId),
        votes: vote._sum?.voteCount,
      }));

      return reply.send({
        success: true,
        data: leaderboard,
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
}
