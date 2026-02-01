import { PrismaClient } from "@prisma/client";

declare module "fastify" {
  interface FastifyInstance {
    prisma: PrismaClient;
  }

  interface FastifyRequest {
    user?: {
      id?: number;
      userId: number;
      username: string;
      email?: string;
    };
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
