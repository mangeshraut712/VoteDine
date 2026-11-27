import dotenv from "dotenv";
import { z } from "zod";
import { resolveJwtSecret } from "../lib/jwt-secret.js";

dotenv.config();

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    PORT: z.string().default("3001"),
    HOST: z.string().default("0.0.0.0"),
    DATABASE_URL: z.string().url(),
    REDIS_URL: z.string().url().optional(),
    // Length is enforced by resolveJwtSecret, which generates a secret for
    // development and refuses to start in production without a strong one.
    JWT_SECRET: z.string().optional(),
    FRONTEND_URL: z.string().url().default("http://localhost:3000"),
});

const parsedEnv = envSchema.parse(process.env);

export const env = {
    ...parsedEnv,
    JWT_SECRET: resolveJwtSecret(parsedEnv.JWT_SECRET, parsedEnv.NODE_ENV),
};

// Validate required environment variables
export function validateEnv(): void {
    try {
        envSchema.parse(process.env);
    } catch (error) {
        if (error instanceof z.ZodError) {
            const missingVars = error.issues
                .filter((e) => e.code === "invalid_type")
                .map((e) => e.path.join("."));

            if (missingVars.length > 0) {
                throw new Error(
                    `Missing or invalid environment variables: ${missingVars.join(", ")}`
                );
            }
        }
        throw error;
    }
}
