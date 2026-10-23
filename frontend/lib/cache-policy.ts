export interface CacheRequest {
  method: string;
  url: string;
  pageOrigin: string;
}

export function isApiPath(pathname: string): boolean {
  return pathname.split("/").includes("api");
}

export function isCacheableRequest(request: CacheRequest): boolean {
  if (request.method !== "GET") return false;
  let parsed: URL;
  try {
    parsed = new URL(request.url);
  } catch {
    return false;
  }
  if (parsed.origin !== request.pageOrigin) return false;
  if (isApiPath(parsed.pathname)) return false;
  return true;
}

export function shouldStoreResponse(status: number, type: string): boolean {
  return status >= 200 && status < 300 && type === "basic";
}

export function precacheUrls(serviceWorkerHref: string): string[] {
  const base = new URL("./", serviceWorkerHref);
  return ["", "manifest.webmanifest", "icons/votedine-icon.svg"].map((path) => new URL(path, base).href);
}

export function offlineFallbackUrl(requestMode: string, serviceWorkerHref: string): string | null {
  if (requestMode !== "navigate") return null;
  return new URL("./", serviceWorkerHref).href;
}
