export function apiUrl(path: string, base = process.env.NEXT_PUBLIC_API_URL): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (!base) return normalized;
  return `${base.replace(/\/$/, "")}${normalized}`;
}
