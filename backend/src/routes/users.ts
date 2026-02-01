import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from "fastify";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6),
});

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

// Add authentication middleware
async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.send(err);
  }
}

export async function userRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions
) {
  // Register new user
  fastify.post("/register", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { username, password } = registerSchema.parse(request.body);

      const existingUser = await fastify.prisma.user.findUnique({
        where: { username },
      });

      if (existingUser) {
        return reply.status(400).send({
          success: false,
          message: "Username already exists"
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

      const token = fastify.jwt.sign({
        userId: user.id,
        username: user.username
      });

      return reply.send({
        success: true,
        data: { user, token },
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

  // Login user
  fastify.post("/login", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { username, password } = loginSchema.parse(request.body);

      const user = await fastify.prisma.user.findUnique({
        where: { username },
      });

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return reply.status(401).send({
          success: false,
          message: "Invalid credentials",
        });
      }

      const token = fastify.jwt.sign({
        userId: user.id,
        username: user.username,
      });

      return reply.send({
        success: true,
        data: {
          user: {
            id: user.id,
            username: user.username,
          },
          token,
        },
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

  // Get current user
  fastify.get("/me", { preHandler: [authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { userId } = request.user!;

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
