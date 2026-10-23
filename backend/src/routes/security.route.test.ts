import Fastify, { FastifyInstance, FastifyRequest } from "fastify";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PrismaClient } from "@prisma/client";
import { voteRoutes } from "./votes.js";
import { roomRoutes } from "./rooms.js";
import { calendarRoutes } from "./calendar.js";
import { socialShareRoutes } from "./social-share.js";
import { restaurantRoutes } from "./restaurants.js";
import { userRoutes } from "./users.js";
import { voiceCommandsRoutes } from "./voice-commands.js";
import { recommendationSchema } from "./recommendations.js";
import { searchSchema } from "./restaurants.js";
import { joinRoomBodySchema } from "./rooms.js";
import { CalendarService } from "../services/calendar.js";

function unauthorized(code: string) {
  const error = new Error(code) as Error & { code: string };
  error.code = code;
  return error;
}

async function buildApp(register: (app: FastifyInstance) => Promise<unknown>, prisma: unknown) {
  const app = Fastify({ logger: false });
  app.decorate("prisma", prisma as PrismaClient);
  app.decorate("jwt", {
    sign: (payload: { userId: number }) => `signed-${payload.userId}`,
    options: {},
    verify: () => ({ userId: 7 }),
    decode: () => ({ userId: 7 }),
    lookupToken: () => "valid",
  } as unknown as FastifyInstance["jwt"]);
  app.decorateRequest("jwtVerify", async function (this: FastifyRequest) {
    const header = this.headers.authorization;
    if (!header) throw unauthorized("FST_JWT_NO_AUTHORIZATION_HEADER");
    const token = header.replace(/^Bearer\s+/i, "");
    if (token !== "valid") throw unauthorized("FST_JWT_AUTHORIZATION_TOKEN_INVALID");
    this.user = { id: 7, userId: 7, username: "ada" };
  });
  await register(app);
  return app;
}

describe("authenticated routes", () => {
  const apps: FastifyInstance[] = [];

  beforeEach(() => {
    Reflect.set(CalendarService, "instance", undefined);
  });

  afterEach(async () => {
    await Promise.all(apps.splice(0).map((app) => app.close()));
  });

  it("does not record an anonymous vote as user 1", async () => {
    const vote = { findFirst: vi.fn(), create: vi.fn(), update: vi.fn() };
    const app = await buildApp((instance) => voteRoutes(instance, {}), { vote });
    apps.push(app);

    const response = await app.inject({
      method: "POST",
      url: "/",
      payload: { restaurantId: 3, increment: 1 },
    });

    expect(response.statusCode).toBe(401);
    expect(vote.findFirst).not.toHaveBeenCalled();
    expect(vote.create).not.toHaveBeenCalled();
  });

  it("attributes a vote to the token user and will not go negative", async () => {
    const vote = {
      findFirst: vi.fn(async () => ({ id: 9, voteCount: 0 })),
      update: vi.fn(async ({ data }: { data: { voteCount: number } }) => ({ id: 9, voteCount: data.voteCount })),
      create: vi.fn(),
    };
    const app = await buildApp((instance) => voteRoutes(instance, {}), { vote });
    apps.push(app);

    const response = await app.inject({
      method: "POST",
      url: "/",
      headers: { authorization: "Bearer valid" },
      payload: { restaurantId: 3, userId: 1, increment: -1 },
    });

    expect(response.statusCode).toBe(200);
    expect(vote.findFirst).toHaveBeenCalledWith({ where: { userId: 7, restaurantId: 3, roomId: null } });
    expect(vote.update).toHaveBeenCalledWith({ where: { id: 9 }, data: { voteCount: 0 } });
    expect(JSON.parse(response.body).data.voteCount).toBe(0);
  });

  it("rejects a leaderboard limit that is not a small integer", async () => {
    const app = await buildApp((instance) => voteRoutes(instance, {}), { vote: { groupBy: vi.fn() }, restaurant: { findMany: vi.fn() } });
    apps.push(app);
    const response = await app.inject({ method: "GET", url: "/leaderboard?limit=100000" });
    expect(response.statusCode).toBe(400);
  });

  it("lets a guest join with a name and blocks anonymous room closure", async () => {
    const room = {
      findUnique: vi.fn(async () => ({ id: "room-1", code: "FRIDAY01", isActive: true })),
      create: vi.fn(),
      update: vi.fn(),
    };
    const roomMember = {
      create: vi.fn(async ({ data }: { data: { guestName?: string } }) => ({ id: 1, ...data })),
      findFirst: vi.fn(),
    };
    const app = await buildApp((instance) => roomRoutes(instance, {}), { room, roomMember });
    apps.push(app);

    const join = await app.inject({
      method: "POST",
      url: "/FRIDAY01/join",
      payload: { guestName: "Sam" },
    });
    expect(join.statusCode).toBe(200);
    expect(roomMember.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ guestName: "Sam", roomId: "room-1" }),
    }));

    const close = await app.inject({ method: "PATCH", url: "/FRIDAY01/close" });
    expect(close.statusCode).toBe(401);
    expect(room.update).not.toHaveBeenCalled();
  });

  it("refuses to list another user's calendar when no token is present", async () => {
    const calendarEvent = { findMany: vi.fn(), create: vi.fn() };
    const app = await buildApp((instance) => calendarRoutes(instance), {
      calendarEvent,
      room: { findFirst: vi.fn() },
    });
    apps.push(app);

    const response = await app.inject({ method: "GET", url: "/events" });
    expect(response.statusCode).toBe(401);
    expect(calendarEvent.findMany).not.toHaveBeenCalled();
  });

  it("stores a calendar event on the room id, not the share code", async () => {
    const calendarEvent = {
      create: vi.fn(async ({ data }: { data: { roomId?: string; title: string; userId: number } }) => ({
        id: "event-1",
        title: data.title,
        description: null,
        startTime: new Date("2026-10-23T18:00:00.000Z"),
        endTime: new Date("2026-10-23T19:00:00.000Z"),
        location: null,
        roomId: data.roomId,
        status: "SCHEDULED",
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    };
    const room = { findFirst: vi.fn(async () => ({ id: "11111111-1111-1111-1111-111111111111", code: "FRIDAY01" })) };
    const app = await buildApp((instance) => calendarRoutes(instance), { calendarEvent, room });
    apps.push(app);

    const response = await app.inject({
      method: "POST",
      url: "/events",
      headers: { authorization: "Bearer valid" },
      payload: {
        roomId: "FRIDAY01",
        title: "Dinner",
        startTime: "2026-10-23T18:00:00.000Z",
        endTime: "2026-10-23T19:00:00.000Z",
      },
    });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body).eventId).toBe("event-1");
    expect(calendarEvent.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        userId: 7,
        roomId: "11111111-1111-1111-1111-111111111111",
        title: "Dinner",
      }),
    }));
  });

  it("serves share links at /api/share and rejects javascript URLs", async () => {
    const app = await buildApp(async (instance) => {
      await instance.register(socialShareRoutes, { prefix: "/api/share" });
    }, {});
    apps.push(app);

    const created = await app.inject({
      method: "POST",
      url: "/api/share",
      payload: { type: "room", title: "Dinner", description: "Come vote", roomCode: "FRIDAY01" },
    });
    expect(created.statusCode).toBe(200);
    expect(JSON.parse(created.body).content.url).toContain("/rooms/FRIDAY01");

    const legacy = await app.inject({
      method: "POST",
      url: "/api/share/api/social/share",
      payload: { type: "room", title: "Dinner", description: "Come vote", roomCode: "FRIDAY01" },
    });
    expect(legacy.statusCode).toBe(404);

    const qr = await app.inject({
      method: "GET",
      url: "/api/share/qr?url=javascript:alert(1)",
    });
    expect(qr.statusCode).toBe(400);
  });

  it("rejects a non-numeric restaurant id before querying", async () => {
    const restaurant = { findUnique: vi.fn(), findMany: vi.fn() };
    const app = await buildApp((instance) => restaurantRoutes(instance, {}), { restaurant });
    apps.push(app);
    const response = await app.inject({ method: "GET", url: "/15abc" });
    expect(response.statusCode).toBe(400);
    expect(restaurant.findUnique).not.toHaveBeenCalled();
  });

  it("rejects an oversized voice payload", async () => {
    const app = await buildApp((instance) => voiceCommandsRoutes(instance), {});
    apps.push(app);
    const response = await app.inject({
      method: "POST",
      url: "/process",
      payload: { audio: "a".repeat(500_001) },
    });
    expect(response.statusCode).toBe(400);
  });

  it("returns 401 instead of another user's profile when the token is missing", async () => {
    const user = { findUnique: vi.fn() };
    const app = await buildApp((instance) => userRoutes(instance, {}), { user });
    apps.push(app);
    const response = await app.inject({ method: "GET", url: "/me" });
    expect(response.statusCode).toBe(401);
    expect(user.findUnique).not.toHaveBeenCalled();
  });
});

describe("query schemas", () => {
  it("keeps latitude 0 and coerces recommendation filters from query strings", () => {
    expect(searchSchema.parse({ latitude: 0, longitude: "0" })).toMatchObject({ latitude: 0, longitude: 0 });
    expect(() => searchSchema.parse({ latitude: "91" })).toThrow();
    expect(recommendationSchema.parse({ groupSize: "4", dietary: "vegan,halal" })).toMatchObject({
      groupSize: 4,
      dietary: ["vegan", "halal"],
    });
    expect(joinRoomBodySchema.parse({ guestName: "Sam" })).toEqual({ guestName: "Sam" });
  });
});
