const MAX_URL_LENGTH = 2000;

export function isSafeHttpUrl(value: string): boolean {
  if (value.length === 0 || value.length > MAX_URL_LENGTH) return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/** Remove CR/LF so share titles cannot inject extra mailto headers. */
export function sanitizeShareText(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}
