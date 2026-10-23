import { ZodError } from "zod";

export interface PublicErrorBody {
  success: false;
  message: string;
  errors?: unknown[];
}

export interface PublicError {
  statusCode: number;
  body: PublicErrorBody;
}

export function prismaErrorCode(error: unknown): string | null {
  if (typeof error !== "object" || error === null) return null;
  const record = error as { name?: unknown; code?: unknown };
  if (record.name !== "PrismaClientKnownRequestError" || typeof record.code !== "string") return null;
  return record.code;
}

export function toPublicError(error: unknown): PublicError {
  if (error instanceof ZodError) {
    return {
      statusCode: 400,
      body: {
        success: false,
        message: "Validation error",
        errors: error.issues,
      },
    };
  }

  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code?: unknown }).code ?? "")
      : "";

  if (
    code === "FST_JWT_NO_AUTHORIZATION_HEADER" ||
    code === "FST_JWT_AUTHORIZATION_TOKEN_EXPIRED" ||
    code === "FST_JWT_AUTHORIZATION_TOKEN_INVALID"
  ) {
    return { statusCode: 401, body: { success: false, message: "Unauthorized" } };
  }

  if (code === "FST_ERR_RATE_LIMIT_EXCEEDED") {
    return {
      statusCode: 429,
      body: { success: false, message: "Too many requests. Please try again later." },
    };
  }

  const prismaCode = prismaErrorCode(error);
  if (prismaCode === "P2025") {
    return { statusCode: 404, body: { success: false, message: "Not found" } };
  }
  if (prismaCode === "P2002") {
    return { statusCode: 409, body: { success: false, message: "Already exists" } };
  }
  if (prismaCode === "P2003") {
    return { statusCode: 400, body: { success: false, message: "Related record not found" } };
  }
  if (prismaCode) {
    return { statusCode: 500, body: { success: false, message: "Database error occurred" } };
  }

  const statusCode =
    typeof error === "object" &&
    error !== null &&
    "statusCode" in error &&
    typeof (error as { statusCode?: unknown }).statusCode === "number"
      ? (error as { statusCode: number }).statusCode
      : 500;

  if (statusCode >= 500) {
    return { statusCode, body: { success: false, message: "Internal server error" } };
  }

  const message = error instanceof Error && error.message ? error.message : "Request failed";
  return { statusCode, body: { success: false, message } };
}
