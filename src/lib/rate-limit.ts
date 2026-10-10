import { ActionError } from "./action";

const hits = new Map<string, number[]>();

/**
 * Sliding-window limiter kept in memory. On serverless hosts each instance has its own
 * window, so this is a speed bump against spam and double-submits, not a hard quota.
 */
export function rateLimit(key: string, limit: number, windowMs: number, now = Date.now()) {
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    throw new ActionError("You're doing that too fast. Please wait a moment.");
  }
  recent.push(now);
  hits.set(key, recent);

  // Keep the map from growing forever on long-lived servers.
  if (hits.size > 5000) {
    for (const [k, times] of hits) {
      if (times.every((t) => now - t >= windowMs)) hits.delete(k);
    }
  }
}

export const LIMITS = {
  post: { limit: 10, windowMs: 60_000 },
  comment: { limit: 20, windowMs: 60_000 },
  reaction: { limit: 60, windowMs: 60_000 },
  follow: { limit: 30, windowMs: 60_000 },
} as const;

export function limit(kind: keyof typeof LIMITS, userId: string) {
  const { limit: max, windowMs } = LIMITS[kind];
  rateLimit(`${kind}:${userId}`, max, windowMs);
}

/** For tests. */
export function resetRateLimits() {
  hits.clear();
}
