import { FastifyRequest, FastifyReply } from "fastify";

export function securityHeaders(
    request: FastifyRequest,
    reply: FastifyReply,
    done: () => void
): void {
    // Prevent clickjacking
    reply.header("X-Frame-Options", "DENY");
    reply.header("Content-Security-Policy", "frame-ancestors 'none'");

    // Prevent MIME type sniffing
    reply.header("X-Content-Type-Options", "nosniff");

    // Enable XSS protection
    reply.header("X-XSS-Protection", "1; mode=block");

    // Referrer policy
    reply.header("Referrer-Policy", "strict-origin-when-cross-origin");

    // Permissions policy
    reply.header(
        "Permissions-Policy",
        "geolocation=(), microphone=(), camera=()"
    );

    // HSTS (only in production)
    if (process.env.NODE_ENV === "production") {
        reply.header(
            "Strict-Transport-Security",
            "max-age=31536000; includeSubDomains"
        );
    }

    done();
}

export function corsOptions(): Record<string, unknown> {
    return {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        exposedHeaders: ["Content-Range", "X-Content-Range"],
        maxAge: 86400, // 24 hours
    };
}
