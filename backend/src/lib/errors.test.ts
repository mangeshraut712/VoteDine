import { describe, expect, it } from "vitest";
import { ZodError, z } from "zod";
import { toPublicError } from "./errors.js";

describe("toPublicError", () => {
  it("hides internal messages for server and database failures", () => {
    expect(toPublicError(new Error("password=secret")).body.message).toBe("Internal server error");
    expect(toPublicError({
      name: "PrismaClientKnownRequestError",
      code: "P2025",
      message: "Record users where id = secret",
    })).toEqual({ statusCode: 404, body: { success: false, message: "Not found" } });
    expect(toPublicError({
      name: "PrismaClientKnownRequestError",
      code: "P2002",
      message: "Unique constraint failed on the fields: (`username`)",
    }).statusCode).toBe(409);
  });

  it("keeps validation issues and client error messages", () => {
    const parsed = z.object({ name: z.string() }).safeParse({});
    expect(parsed.success).toBe(false);
    if (parsed.success) return;
    const error = new ZodError(parsed.error.issues);
    expect(toPublicError(error).statusCode).toBe(400);
    expect(toPublicError(Object.assign(new Error("Invalid room code"), { statusCode: 400 })).body.message).toBe("Invalid room code");
  });
});
