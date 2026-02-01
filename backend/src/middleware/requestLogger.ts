import { FastifyRequest, FastifyReply } from "fastify";
import { logger } from "../utils/logger.js";

export function requestLogger(
    request: FastifyRequest,
    reply: FastifyReply,
    done: () => void
): void {
    const startTime = Date.now();

    reply.raw.on("finish", () => {
        const duration = Date.now() - startTime;
        const statusCode = reply.statusCode;

        // Log request details
        logger.info({
            method: request.method,
            url: request.url,
            statusCode,
            duration: `${duration}ms`,
            ip: request.ip,
            userAgent: request.headers["user-agent"],
        });

        // Log slow requests (> 1 second)
        if (duration > 1000) {
            logger.warn({
                message: "Slow request detected",
                method: request.method,
                url: request.url,
                duration: `${duration}ms`,
            });
        }
    });

    done();
}
