import Fastify, { FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import { analyticsRoutes } from "./analytics.js";

describe("analytics overview", () => {
  it("reports the cuisine with the most votes, not the largest catalog", async () => {
    const restaurant = {
      count: vi.fn(async () => 4),
      findMany: vi.fn(async () => []),
      groupBy: vi.fn(async () => [{ cuisine: "Italian", _count: { cuisine: 3 } }]),
    };
    const vote = {
      aggregate: vi.fn(async () => ({ _sum: { voteCount: 7 } })),
      groupBy: vi.fn(async () => []),
      findMany: vi.fn(async (args: { select?: { restaurant?: unknown } }) => {
        if (args.select?.restaurant) {
          return [
            { voteCount: 1, restaurant: { cuisine: "Italian" } },
            { voteCount: 1, restaurant: { cuisine: "Italian" } },
            { voteCount: 1, restaurant: { cuisine: "Italian" } },
            { voteCount: 4, restaurant: { cuisine: "Mexican" } },
          ];
        }
        return [];
      }),
    };
    const app: FastifyInstance = Fastify({ logger: false });
    app.decorate("prisma", {
      room: {
        count: vi.fn()
          .mockResolvedValueOnce(2)
          .mockResolvedValueOnce(1),
      },
      user: { count: vi.fn(async () => 1) },
      restaurant,
      vote,
    } as unknown as PrismaClient);
    await app.register(analyticsRoutes);

    const response = await app.inject({ method: "GET", url: "/overview" });

    expect(response.statusCode).toBe(200);
    expect(response.json().data.topCuisine).toBe("Mexican");
    expect(restaurant.groupBy).not.toHaveBeenCalled();
    await app.close();
  });
});
