/**
 * Keeps only the most recent async request. Begin() aborts the previous
 * fetch (if any) and returns a handle whose isCurrent() is false once a
 * newer begin() has run, so a late finally cannot clear a later loading
 * flag or overwrite later results.
 */
export type LatestRequest = {
  signal: AbortSignal;
  isCurrent: () => boolean;
};

export function createLatestRequest() {
  let generation = 0;
  let controller: AbortController | null = null;

  return {
    begin(): LatestRequest {
      controller?.abort();
      controller = new AbortController();
      const id = ++generation;
      const signal = controller.signal;
      return {
        signal,
        isCurrent: () => id === generation,
      };
    },
  };
}
