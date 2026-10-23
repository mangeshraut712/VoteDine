import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from "fastify";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { getAuthUserId } from "../lib/auth-user.js";
import { prismaErrorCode } from "../lib/errors.js";
import { passwordMatches } from "../lib/password.js";
import { authenticate } from "../middleware/authenticate.js";

const usernameSchema = z.string().trim().min(3).max(50).regex(/^[A-Za-z0-9_-]+$/);
const passwordSchema = z.string().min(6).max(72);

export const registerSchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
});

const authRateLimit = {
  config: {
    rateLimit: {
      max: 10,
      timeWindow: "1 minute",
    },
  },
};

function signToken(fastify: FastifyInstance, user: { id: number; username: string }) {
  return fastify.jwt.sign({
    id: user.id,
    userId: user.id,
    username: user.username,
  });
}

export async function userRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions
) {
  fastify.post("/register", authRateLimit, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { username, password } = registerSchema.parse(request.body);

      const existingUser = await fastify.prisma.user.findUnique({
        where: { username },
      });

      if (existingUser) {
        return reply.status(400).send({
          success: false,
          message: "Username already exists",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await fastify.prisma.user.create({
        data: {
          username,
          password: hashedPassword,
        },
        select: {
          id: true,
          username: true,
          createdAt: true,
        },
      });

      return reply.send({
        success: true,
        data: { user, token: signToken(fastify, user) },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          success: false,
          message: "Invalid input",
          errors: error.issues,
        });
      }
      if (prismaErrorCode(error) === "P2002") {
        return reply.status(400).send({
          success: false,
          message: "Username already exists",
        });
      }
      throw error;
    }
  });

  fastify.post("/login", authRateLimit, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { username, password } = loginSchema.parse(request.body);

      const user = await fastify.prisma.user.findUnique({
        where: { username },
      });

      if (!(await passwordMatches(user?.password, password))) {
        return reply.status(401).send({
          success: false,
          message: "Invalid credentials",
        });
      }

      if (!user) {
        return reply.status(401).send({
          success: false,
          message: "Invalid credentials",
        });
      }

      return reply.send({
        success: true,
        data: {
          user: {
            id: user.id,
            username: user.username,
          },
          token: signToken(fastify, user),
        },
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

  fastify.get("/me", { preHandler: [authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = getAuthUserId(request.user);
    if (userId === null) {
      return reply.status(401).send({ success: false, message: "Unauthorized" });
    }

    const user = await fastify.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        createdAt: true,
        votes: {
          include: {
            restaurant: true,
          },
          orderBy: {
            voteCount: "desc",
          },
          take: 5,
        },
      },
    });

    if (!user) {
      return reply.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    return reply.send({
      success: true,
      data: user,
    });
  });
}
