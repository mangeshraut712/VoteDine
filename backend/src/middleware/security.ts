import type { onSendHookHandler } from "fastify";

// onSend is (request, reply, payload, done). Treating the payload as `done`
// throws "done is not a function" and turns every response into a 500.
export const securityHeaders: onSendHookHandler = function (_request, reply, payload, done) {
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

    done(null, payload);
};

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
