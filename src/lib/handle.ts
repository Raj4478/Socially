/** Turns a Clerk username / email prefix into a valid @handle: 3–20 chars of a-z, 0-9, _. */
export function toHandle(raw: string): string {
  const cleaned = raw.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 20);
  return cleaned.length >= 3 ? cleaned : `user${cleaned}`.padEnd(6, "0");
}
