import { Server, Socket } from "socket.io";
import { PrismaClient } from "@prisma/client";
import { logger } from "@/utils/logger.js";

interface RoomMessage {
  roomId: string;
  content: string;
  userId?: number;
  guestName?: string;
}

interface VoteData {
  roomId: string;
  restaurantId: number;
  userId?: number;
  guestName?: string;
}

interface RoomData {
  roomId: string;
  userId?: number;
  guestName?: string;
}

export function setupSocketHandlers(io: Server, prisma: PrismaClient) {
  io.on("connection", (socket: Socket) => {
    logger.info(`Client connected: ${socket.id}`);

    // Join room
    socket.on("join-room", async (data: RoomData) => {
      try {
        const { roomId, userId, guestName } = data;

        // Verify room exists
        const room = await prisma.room.findUnique({
          where: { id: roomId },
        });

        if (!room) {
          socket.emit("error", { message: "Room not found" });
          return;
        }

        socket.join(roomId);

        // Notify others in room
        socket.to(roomId).emit("user-joined", {
          userId,
          guestName,
          socketId: socket.id,
        });

        logger.info(`Socket ${socket.id} joined room ${roomId}`);
      } catch (error) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const err = error as any;
        logger.error("Error joining room:", err);
        socket.emit("error", { message: "Failed to join room" });
      }
    });

    // Leave room
    socket.on("leave-room", (roomId: string) => {
      socket.leave(roomId);
      socket.to(roomId).emit("user-left", { socketId: socket.id });
      logger.info(`Socket ${socket.id} left room ${roomId}`);
    });

    // Handle chat messages
    socket.on("send-message", async (data: RoomMessage) => {
      try {
        const { roomId, content, userId, guestName } = data;

        // Save message to database
        const message = await prisma.message.create({
          data: {
            roomId,
            content,
            userId,
            guestName,
          },
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        });

        // Broadcast message to room
        io.to(roomId).emit("new-message", message);
      } catch (error) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const err = error as any;
        logger.error("Error sending message:", err);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Handle votes
    socket.on("vote", async (data: VoteData) => {
      try {
        const { roomId, restaurantId, userId } = data;

        // Update or create vote
        await prisma.vote.upsert({
          where: {
            userId_restaurantId_roomId: {
              userId: userId || 0,
              restaurantId,
              roomId,
            },
          },
          update: {
            voteCount: {
              increment: 1,
            },
          },
          create: {
            userId: userId || 0,
            restaurantId,
            roomId,
            voteCount: 1,
          },
        });

        // Get updated votes for the room
        const votes = await prisma.vote.groupBy({
          by: ["restaurantId"],
          where: { roomId },
          _sum: {
            voteCount: true,
          },
        });

        // Broadcast vote update to room
        io.to(roomId).emit("vote-updated", {
          restaurantId,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          votes: votes.find((v: any) => v.restaurantId === restaurantId)?._sum?.voteCount || 0,
          totalVotes: votes,
        });
      } catch (error) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const err = error as any;
        logger.error("Error voting:", err);
        socket.emit("error", { message: "Failed to vote" });
      }
    });

    // Handle restaurant additions
    socket.on("add-restaurant", async (data: { roomId: string; restaurantId: number; addedBy?: number }) => {
      try {
        const { roomId, restaurantId, addedBy } = data;

        const roomRestaurant = await prisma.roomRestaurant.create({
          data: {
            roomId,
            restaurantId,
            addedBy,
          },
          include: {
            restaurant: true,
          },
        });

        io.to(roomId).emit("restaurant-added", roomRestaurant);
      } catch (error) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const err = error as any;
        logger.error("Error adding restaurant:", err);
        socket.emit("error", { message: "Failed to add restaurant" });
      }
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });
  });
}
