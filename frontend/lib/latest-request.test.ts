import { describe, expect, it } from "vitest";
import { createLatestRequest } from "./latest-request";

describe("createLatestRequest", () => {
  it("a slower earlier request does not replace later results or clear a newer loading flag", async () => {
    const latest = createLatestRequest();
    let results = "";
    let loading = false;

    let resolveFirst!: (value: string) => void;
    const first = new Promise<string>((resolve) => {
      resolveFirst = resolve;
    });
    let resolveSecond!: (value: string) => void;
    const second = new Promise<string>((resolve) => {
      resolveSecond = resolve;
    });

    async function run(work: Promise<string>) {
      const request = latest.begin();
      loading = true;
      try {
        const value = await work;
        if (request.isCurrent()) results = value;
      } finally {
        if (request.isCurrent()) loading = false;
      }
    }

    const pendingFirst = run(first);
    const pendingSecond = run(second);

    resolveSecond("pizza");
    await pendingSecond;
    expect(results).toBe("pizza");
    expect(loading).toBe(false);

    resolveFirst("tacos");
    await pendingFirst;
    expect(results).toBe("pizza");
    expect(loading).toBe(false);
  });

  it("begin() aborts the previous signal", () => {
    const latest = createLatestRequest();
    const first = latest.begin();
    expect(first.signal.aborted).toBe(false);
    const second = latest.begin();
    expect(first.signal.aborted).toBe(true);
    expect(second.signal.aborted).toBe(false);
    expect(first.isCurrent()).toBe(false);
    expect(second.isCurrent()).toBe(true);
  });
});
