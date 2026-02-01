import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { Server } from "socket.io";
import { createServer } from "http";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { userRoutes } from "./routes/users.js";
import { roomRoutes } from "./routes/rooms.js";
import { restaurantRoutes } from "./routes/restaurants.js";
import { voteRoutes } from "./routes/votes.js";
import { recommendationRoutes } from "./routes/recommendations.js";
import { analyticsRoutes } from "./routes/analytics.js";
import { calendarRoutes } from "./routes/calendar.js";
import { socialShareRoutes } from "./routes/social-share.js";
import { voiceCommandsRoutes } from "./routes/voice-commands.js";
import { setupSocketHandlers } from "./socket/handlers.js";
import { logger } from "./utils/logger.js";

dotenv.config();

const prisma = new PrismaClient();

const fastify = Fastify({
  logger: true,
});

const server = createServer(fastify.server);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

async function main() {
  // Register plugins
  await fastify.register(cors, {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  });

  await fastify.register(jwt, {
    secret: process.env.JWT_SECRET || "your-secret-key",
  });

  await fastify.register(swagger, {
    openapi: {
      info: {
        title: "VoteDine API",
        description: "API for VoteDine group dining",
        version: "2.0.0",
      },
    },
  });

  await fastify.register(swaggerUi, {
    routePrefix: "/docs",
  });

  // Decorate with Prisma
  fastify.decorate("prisma", prisma);

  // Register routes
  await fastify.register(userRoutes, { prefix: "/api/users" });
  await fastify.register(roomRoutes, { prefix: "/api/rooms" });
  await fastify.register(restaurantRoutes, { prefix: "/api/restaurants" });
  await fastify.register(voteRoutes, { prefix: "/api/votes" });
  await fastify.register(recommendationRoutes, { prefix: "/api/recommendations" });
  await fastify.register(analyticsRoutes, { prefix: "/api/analytics" });
  await fastify.register(calendarRoutes, { prefix: "/api/calendar" });
  await fastify.register(socialShareRoutes, { prefix: "/api/share" });
  await fastify.register(voiceCommandsRoutes, { prefix: "/api/voice" });

  // Setup Socket.io handlers
  setupSocketHandlers(io, prisma);

  // Health check
  fastify.get("/health", async () => {
    return { status: "ok", timestamp: new Date().toISOString() };
  });

  const port = parseInt(process.env.PORT || "3001");
  const host = process.env.HOST || "0.0.0.0";

  try {
    await fastify.listen({ port, host });
    logger.info(`Server running on http://${host}:${port}`);
    logger.info(`Documentation available at http://${host}:${port}/docs`);
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
}

main();

export { fastify, prisma, io };
