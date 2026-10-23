import { Server, Socket } from "socket.io";
import { PrismaClient } from "@prisma/client";
import { logger } from "../utils/logger.js";
import { resolveVoteWrite } from "../lib/votes.js";
import { roomLookupFilter } from "../lib/room-code.js";
import { prismaErrorCode } from "../lib/errors.js";
import {
  addRestaurantPayloadSchema,
  messagePayloadSchema,
  votePayloadSchema,
} from "./payloads.js";

export interface SocketAuth {
  userId: number;
}

function socketUserId(socket: Socket): number | undefined {
  const userId = (socket.data as { userId?: unknown }).userId;
  return typeof userId === "number" && Number.isInteger(userId) && userId > 0 ? userId : undefined;
}

async function findRoom(prisma: PrismaClient, roomKey: string) {
  return prisma.room.findFirst({
    where: roomLookupFilter(roomKey),
  });
}

export function setupSocketHandlers(
  io: Server,
  prisma: PrismaClient,
  verifyToken: (token: string) => SocketAuth | null = () => null,
) {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (token === undefined || token === null || token === "") {
      next();
      return;
    }
    if (typeof token !== "string") {
      next(new Error("Unauthorized"));
      return;
    }
    const auth = verifyToken(token);
    if (!auth) {
      next(new Error("Unauthorized"));
      return;
    }
    (socket.data as { userId?: number }).userId = auth.userId;
    next();
  });

  io.on("connection", (socket: Socket) => {
    logger.info(`Client connected: ${socket.id}`);

    socket.on("join-room", async (data: { roomId?: unknown; guestName?: unknown }) => {
      try {
        if (!data || typeof data.roomId !== "string") {
          socket.emit("error", { message: "Room not found" });
          return;
        }
        const room = await findRoom(prisma, data.roomId);
        if (!room || !room.isActive) {
          socket.emit("error", { message: "Room not found" });
          return;
        }

        const guestName = typeof data.guestName === "string" ? data.guestName.trim().slice(0, 50) : "";
        socket.join(room.id);
        socket.to(room.id).emit("user-joined", {
          userId: socketUserId(socket),
          guestName: guestName || undefined,
          socketId: socket.id,
        });
        logger.info(`Socket ${socket.id} joined room ${room.id}`);
      } catch (error) {
        logger.error("Error joining room:", error);
        socket.emit("error", { message: "Failed to join room" });
      }
    });

    socket.on("leave-room", async (roomKey: unknown) => {
      if (typeof roomKey !== "string") return;
      const room = await findRoom(prisma, roomKey);
      const roomId = room?.id ?? roomKey;
      socket.leave(roomId);
      socket.to(roomId).emit("user-left", { socketId: socket.id });
      logger.info(`Socket ${socket.id} left room ${roomId}`);
    });

    socket.on("send-message", async (data: unknown) => {
      try {
        const parsed = messagePayloadSchema.safeParse(data);
        if (!parsed.success) {
          socket.emit("error", { message: "Invalid message" });
          return;
        }
        const room = await findRoom(prisma, parsed.data.roomId);
        if (!room) {
          socket.emit("error", { message: "Room not found" });
          return;
        }

        const message = await prisma.message.create({
          data: {
            roomId: room.id,
            content: parsed.data.content,
            userId: socketUserId(socket),
            guestName: parsed.data.guestName,
          },
          include: {
            user: {
              select: { id: true, username: true },
            },
          },
        });

        io.to(room.id).emit("new-message", message);
      } catch (error) {
        logger.error("Error sending message:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    socket.on("vote", async (data: unknown) => {
      try {
        const parsed = votePayloadSchema.safeParse(data);
        if (!parsed.success) {
          socket.emit("error", { message: "Invalid vote" });
          return;
        }
        const userId = socketUserId(socket);
        if (!userId) {
          socket.emit("error", { message: "Sign in to vote" });
          return;
        }
        const room = await findRoom(prisma, parsed.data.roomId);
        if (!room || !room.isActive) {
          socket.emit("error", { message: "Room not found" });
          return;
        }

        const existing = await prisma.vote.findFirst({
          where: {
            userId,
            restaurantId: parsed.data.restaurantId,
            roomId: room.id,
          },
        });
        const decision = resolveVoteWrite(existing?.voteCount ?? null, parsed.data.increment);
        if (decision.ok === false) {
          socket.emit("error", { message: decision.message });
          return;
        }

        if (existing) {
          await prisma.vote.update({
            where: { id: existing.id },
            data: { voteCount: decision.voteCount },
          });
        } else {
          await prisma.vote.create({
            data: {
              userId,
              restaurantId: parsed.data.restaurantId,
              roomId: room.id,
              voteCount: decision.voteCount,
            },
          });
        }

        const votes = await prisma.vote.groupBy({
          by: ["restaurantId"],
          where: { roomId: room.id },
          _sum: { voteCount: true },
        });

        io.to(room.id).emit("vote-updated", {
          restaurantId: parsed.data.restaurantId,
          votes: votes.find((vote) => vote.restaurantId === parsed.data.restaurantId)?._sum?.voteCount || 0,
          totalVotes: votes,
        });
      } catch (error) {
        logger.error("Error voting:", error);
        socket.emit("error", { message: "Failed to vote" });
      }
    });

    socket.on("add-restaurant", async (data: unknown) => {
      try {
        const parsed = addRestaurantPayloadSchema.safeParse(data);
        if (!parsed.success) {
          socket.emit("error", { message: "Invalid restaurant" });
          return;
        }
        const room = await findRoom(prisma, parsed.data.roomId);
        if (!room || !room.isActive) {
          socket.emit("error", { message: "Room not found" });
          return;
        }

        let restaurant = parsed.data.restaurantId
          ? await prisma.restaurant.findUnique({ where: { id: parsed.data.restaurantId } })
          : await prisma.restaurant.findFirst({
              where: { name: { equals: parsed.data.name, mode: "insensitive" } },
            });

        if (!restaurant && parsed.data.name) {
          try {
            restaurant = await prisma.restaurant.create({ data: { name: parsed.data.name } });
          } catch (error) {
            if (prismaErrorCode(error) !== "P2002") throw error;
            restaurant = await prisma.restaurant.findFirst({
              where: { name: { equals: parsed.data.name, mode: "insensitive" } },
            });
          }
        }

        if (!restaurant) {
          socket.emit("error", { message: "Restaurant not found" });
          return;
        }

        try {
          const roomRestaurant = await prisma.roomRestaurant.create({
            data: {
              roomId: room.id,
              restaurantId: restaurant.id,
              addedBy: socketUserId(socket),
            },
            include: { restaurant: true },
          });
          io.to(room.id).emit("restaurant-added", roomRestaurant);
        } catch (error) {
          if (prismaErrorCode(error) !== "P2002") throw error;
          const existing = await prisma.roomRestaurant.findFirst({
            where: { roomId: room.id, restaurantId: restaurant.id },
            include: { restaurant: true },
          });
          if (existing) io.to(room.id).emit("restaurant-added", existing);
        }
      } catch (error) {
        logger.error("Error adding restaurant:", error);
        socket.emit("error", { message: "Failed to add restaurant" });
      }
    });

    socket.on("disconnect", () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });
  });
}
