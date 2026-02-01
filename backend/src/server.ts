import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import rateLimit from "@fastify/rate-limit";
import { Server } from "socket.io";
import { createServer } from "http";
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
import { validateEnv, env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { securityHeaders, corsOptions } from "./middleware/security.js";
import { requestLogger } from "./middleware/requestLogger.js";

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
  // Validate environment variables
  validateEnv();

  // Register plugins
  await fastify.register(cors, corsOptions());

  // Add security headers
  fastify.addHook("onSend", securityHeaders);

  // Add request logging
  fastify.addHook("onRequest", requestLogger);

  // Add error handler
  fastify.setErrorHandler(errorHandler);
  fastify.setNotFoundHandler(notFoundHandler);

  // Rate limiting
  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: "1 minute",
    errorResponseBuilder: (request, context) => ({
      statusCode: 429,
      error: "Too Many Requests",
      message: `Rate limit exceeded. Try again in ${context.after}`,
    }),
  });

  await fastify.register(jwt, {
    secret: env.JWT_SECRET,
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

  // Health check with database status
  fastify.get("/health", async (request, reply) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return reply.send({
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: "connected",
      });
    } catch (_error) {
      return reply.status(503).send({
        status: "error",
        timestamp: new Date().toISOString(),
        database: "disconnected",
      });
    }
  });

  const port = parseInt(env.PORT);
  const host = env.HOST;

  // Graceful shutdown
  const gracefulShutdown = async (signal: string) => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);
    await fastify.close();
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));

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
