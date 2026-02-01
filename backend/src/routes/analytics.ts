import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";

const trendQuerySchema = z.object({
  days: z
    .string()
    .optional()
    .transform((value) => (value ? parseInt(value, 10) : 7))
    .refine((value) => !Number.isNaN(value) && value >= 1 && value <= 30, {
      message: "Days must be between 1 and 30",
    }),
});

function formatDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function analyticsRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions
) {
  fastify.get("/overview", async (_request: FastifyRequest, reply: FastifyReply) => {
    const [rooms, activeRooms, users, restaurants, votes, topRestaurantsList] = await Promise.all([
      fastify.prisma.room.count(),
      fastify.prisma.room.count({ where: { isActive: true } }),
      fastify.prisma.user.count(),
      fastify.prisma.restaurant.count(),
      fastify.prisma.vote.aggregate({ _sum: { voteCount: true } }),
      // Get top restaurants by votes
      fastify.prisma.restaurant.findMany({
        take: 5,
        include: {
          _count: {
            select: { votes: true }
          }
        },
        orderBy: {
          votes: {
            _count: 'desc'
          }
        }
      })
    ]);

    // Get top cuisine
    const topCuisineGroups = await fastify.prisma.restaurant.groupBy({
      by: ["cuisine"],
      _count: { cuisine: true },
      where: { cuisine: { not: null } },
      orderBy: { _count: { cuisine: "desc" } },
      take: 1,
    });

    // Get last 7 days voting trends
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);

    const votingTrendsData = await fastify.prisma.vote.findMany({
      where: { createdAt: { gte: startDate } },
      select: { createdAt: true, voteCount: true }
    });

    const dayBuckets = new Map<string, number>();
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dayBuckets.set(formatDateKey(date), 0);
    }

    votingTrendsData.forEach((vote) => {
      const key = formatDateKey(vote.createdAt);
      if (dayBuckets.has(key)) {
        dayBuckets.set(key, (dayBuckets.get(key) ?? 0) + vote.voteCount);
      }
    });

    const votingTrends = Array.from(dayBuckets.entries()).map(([date, count]) => ({
      date,
      votes: count,
    }));

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
        topRestaurants: topRestaurantsList.map(r => ({
          name: r.name,
          votes: r._count.votes,
          cuisine: r.cuisine || "Mixed"
        }))
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
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - (days - 1));
      startDate.setHours(0, 0, 0, 0);

      const votes = await fastify.prisma.vote.findMany({
        where: {
          createdAt: {
            gte: startDate,
          },
        },
        select: {
          createdAt: true,
          voteCount: true,
        },
      });

      const dayBuckets = new Map<string, number>();
      for (let i = 0; i < days; i += 1) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        dayBuckets.set(formatDateKey(date), 0);
      }

      votes.forEach((vote) => {
        const key = formatDateKey(vote.createdAt);
        if (dayBuckets.has(key)) {
          dayBuckets.set(key, (dayBuckets.get(key) ?? 0) + vote.voteCount);
        }
      });

      const trend = Array.from(dayBuckets.entries()).map(([date, count]) => ({
        date,
        votes: count,
      }));

      return reply.send({
        success: true,
        data: trend,
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
}
