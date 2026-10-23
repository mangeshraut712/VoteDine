import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { addVotesToBuckets, bucketsToTrend, buildUtcDayBuckets } from "../lib/dates.js";

const trendQuerySchema = z.object({
  days: z
    .string()
    .optional()
    .transform((value) => (value ? parseInt(value, 10) : 7))
    .refine((value) => !Number.isNaN(value) && value >= 1 && value <= 30, {
      message: "Days must be between 1 and 30",
    }),
});

export async function analyticsRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions
) {
  fastify.get("/overview", async (_request: FastifyRequest, reply: FastifyReply) => {
    const [rooms, activeRooms, users, restaurants, votes, topCuisineGroups, voteGroups] = await Promise.all([
      fastify.prisma.room.count(),
      fastify.prisma.room.count({ where: { isActive: true } }),
      fastify.prisma.user.count(),
      fastify.prisma.restaurant.count(),
      fastify.prisma.vote.aggregate({ _sum: { voteCount: true } }),
      fastify.prisma.restaurant.groupBy({
        by: ["cuisine"],
        _count: { cuisine: true },
        where: { cuisine: { not: null } },
        orderBy: { _count: { cuisine: "desc" } },
        take: 1,
      }),
      fastify.prisma.vote.groupBy({
        by: ["restaurantId"],
        _sum: { voteCount: true },
        orderBy: { _sum: { voteCount: "desc" } },
        take: 5,
      }),
    ]);

    const rankedRestaurants = await fastify.prisma.restaurant.findMany({
      where: { id: { in: voteGroups.map((group) => group.restaurantId) } },
    });
    const topRestaurants = voteGroups.flatMap((group) => {
      const restaurant = rankedRestaurants.find((item) => item.id === group.restaurantId);
      if (!restaurant) return [];
      return [{
        name: restaurant.name,
        votes: group._sum.voteCount ?? 0,
        cuisine: restaurant.cuisine || "Mixed",
      }];
    });

    const endDate = new Date();
    const dayBuckets = buildUtcDayBuckets(endDate, 7);
    const windowStart = new Date(`${Array.from(dayBuckets.keys())[0]}T00:00:00.000Z`);

    const votingTrendsData = await fastify.prisma.vote.findMany({
      where: { createdAt: { gte: windowStart } },
      select: { createdAt: true, voteCount: true }
    });
    addVotesToBuckets(dayBuckets, votingTrendsData);
    const votingTrends = bucketsToTrend(dayBuckets);

    const topCuisine = topCuisineGroups[0]?.cuisine ?? "Mixed";
    const totalVotes = votes._sum.voteCount ?? 0;

    return reply.send({
      success: true,
      data: {
        rooms,
        activeRooms,
        users,
        restaurants,
        totalVotes,
        topCuisine,
        votingTrends,
        topRestaurants
      },
    });
  });

  fastify.get("/cuisines", async (_request: FastifyRequest, reply: FastifyReply) => {
    const cuisineGroups = await fastify.prisma.restaurant.groupBy({
      by: ["cuisine"],
      _count: {
        cuisine: true,
      },
      where: {
        cuisine: {
          not: null,
        },
      },
      orderBy: {
        _count: {
          cuisine: "desc",
        },
      },
      take: 6,
    });

    const cuisines = cuisineGroups.map((group) => ({
      cuisine: group.cuisine ?? "Unknown",
      count: group._count.cuisine,
    }));

    return reply.send({
      success: true,
      data: cuisines,
    });
  });

  fastify.get("/trend", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { days } = trendQuerySchema.parse(request.query);
      const dayBuckets = buildUtcDayBuckets(new Date(), days);
      const windowStart = new Date(`${Array.from(dayBuckets.keys())[0]}T00:00:00.000Z`);

      const votes = await fastify.prisma.vote.findMany({
        where: {
          createdAt: {
            gte: windowStart,
          },
        },
        select: {
          createdAt: true,
          voteCount: true,
        },
      });
      addVotesToBuckets(dayBuckets, votes);
      const trend = bucketsToTrend(dayBuckets);

      return reply.send({
        success: true,
        data: trend,
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
