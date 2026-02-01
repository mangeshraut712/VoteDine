import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    PORT: z.string().default("3001"),
    HOST: z.string().default("0.0.0.0"),
    DATABASE_URL: z.string().url(),
    REDIS_URL: z.string().url().optional(),
    JWT_SECRET: z.string().min(32),
    FRONTEND_URL: z.string().url().default("http://localhost:3000"),
});

export const env = envSchema.parse(process.env);

// Validate required environment variables
export function validateEnv(): void {
    try {
        envSchema.parse(process.env);
    } catch (error) {
        if (error instanceof z.ZodError) {
            const missingVars = error.errors
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
