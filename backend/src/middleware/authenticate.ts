import { FastifyReply, FastifyRequest } from "fastify";
import { getAuthUserId } from "../lib/auth-user.js";

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch {
    return reply.status(401).send({ success: false, message: "Unauthorized" });
  }

  if (getAuthUserId(request.user) === null) {
    return reply.status(401).send({ success: false, message: "Unauthorized" });
  }
}
