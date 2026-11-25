import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("make db-reset", () => {
  it("drops the compose volumes instead of a leftover project volume", () => {
    const makefile = readFileSync(join(process.cwd(), "..", "Makefile"), "utf8");
    const reset = makefile.slice(makefile.indexOf("db-reset:"), makefile.indexOf("# Testing"));
    expect(reset).not.toContain("cs375group1_postgres_data");
    expect(reset).toContain("docker-compose down -v");
  });
});
