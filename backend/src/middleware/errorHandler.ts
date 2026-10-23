import { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { toPublicError } from "../lib/errors.js";
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
    logger.error({
        error: error.message,
        stack: error.stack,
        url: request.url,
        method: request.method,
        ip: request.ip,
    });

    const publicError = toPublicError(error);
    reply.status(publicError.statusCode).send(publicError.body);
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
