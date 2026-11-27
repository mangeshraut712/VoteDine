import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function resetTarget(): string {
  const makefile = readFileSync(join(process.cwd(), "..", "Makefile"), "utf8");
  return makefile.slice(makefile.indexOf("db-reset:"), makefile.indexOf("# Testing"));
}

describe("make db-reset", () => {
  it("resolves the postgres volume through compose instead of a hardcoded project name", () => {
    const reset = resetTarget();
    // The old recipe named "cs375group1_postgres_data", which only exists when the
    // checkout directory is called cs375group1; elsewhere it silently reset nothing.
    expect(reset).not.toContain("cs375group1_postgres_data");
    expect(reset).toContain("docker-compose config");
    expect(reset).toContain("docker volume rm");
  });

  it("only touches postgres so the rest of the stack keeps running", () => {
    const reset = resetTarget();
    // `down -v` removes every service and volume, leaving the app offline after a reset.
    expect(reset).not.toContain("down -v");
    expect(reset).not.toMatch(/docker-compose (stop|rm|up)[^\n]*\b(redis|backend|frontend)\b/);
    expect(reset).toContain("docker-compose stop postgres");
    expect(reset).toContain("docker-compose up -d postgres");
  });

  it("fails loudly when the volume name cannot be resolved", () => {
    const reset = resetTarget();
    // An unresolved name must abort the reset; skipping the removal silently
    // would report success while leaving the data in place. The source keeps
    // Make's "$$" escape for a literal "$".
    expect(reset).toMatch(/if \[ -z "\$\$volume" \]; then .*exit 1; fi/);
    expect(reset).not.toMatch(/if \[ -n "\$\$volume" \]; then/);
  });
});
