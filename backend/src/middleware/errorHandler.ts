import { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";
import { logger } from "../utils/logger.js";

export interface ApiError {
    success: false;
    message: string;
    errors?: unknown[];
    statusCode?: number;
}

export function errorHandler(
    error: FastifyError,
    request: FastifyRequest,
    reply: FastifyReply
): void {
    // Log the error
    logger.error({
        error: error.message,
        stack: error.stack,
        url: request.url,
        method: request.method,
        ip: request.ip,
    });

    // Handle Zod validation errors
    if (error instanceof ZodError) {
        reply.status(400).send({
            success: false,
            message: "Validation error",
            errors: error.errors,
        });
        return;
    }

    // Handle JWT errors
    if (error.code === "FST_JWT_NO_AUTHORIZATION_HEADER" ||
        error.code === "FST_JWT_AUTHORIZATION_TOKEN_EXPIRED" ||
        error.code === "FST_JWT_AUTHORIZATION_TOKEN_INVALID") {
        reply.status(401).send({
            success: false,
            message: "Unauthorized",
        });
        return;
    }

    // Handle rate limit errors
    if (error.code === "FST_ERR_RATE_LIMIT_EXCEEDED") {
        reply.status(429).send({
            success: false,
            message: "Too many requests. Please try again later.",
        });
        return;
    }

    // Handle Prisma errors
    if (error.code?.startsWith("P")) {
        reply.status(500).send({
            success: false,
            message: "Database error occurred",
        });
        return;
    }

    // Default error handling
    const statusCode = error.statusCode || 500;
    reply.status(statusCode).send({
        success: false,
        message: error.message || "Internal server error",
    });
}

export function notFoundHandler(
    request: FastifyRequest,
    reply: FastifyReply
): void {
    reply.status(404).send({
        success: false,
        message: `Route ${request.method} ${request.url} not found`,
    });
}
