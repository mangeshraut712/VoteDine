import { PrismaClient } from "@prisma/client";
import "@fastify/jwt";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    user: {
      id: number;
      userId: number;
      username: string;
      email?: string;
    };
  }
}

declare module "fastify" {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

// Create a type that allows any response code
type AnyResponse = {
  [key: string]: unknown;
};

// Extend FastifyReply to allow any status code
declare module "fastify" {
  interface FastifyReply {
    code(statusCode: number): FastifyReply;
  }
}
