// ============================================================
// Simple in-memory rate limiter for server actions
// Uses a sliding-window approach per key (e.g., user ID)
// ============================================================

const store = new Map<string, number[]>();

const WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS = 5;       // Max 5 bulk uploads per minute

export function checkRateLimit(key: string): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();
  const timestamps = store.get(key) || [];

  // Remove expired timestamps
  const valid = timestamps.filter((t) => now - t < WINDOW_MS);

  if (valid.length >= MAX_REQUESTS) {
    const oldestValid = valid[0];
    const retryAfterMs = WINDOW_MS - (now - oldestValid);
    store.set(key, valid);
    return { allowed: false, retryAfterMs };
  }

  valid.push(now);
  store.set(key, valid);
  return { allowed: true, retryAfterMs: 0 };
}

// Clean up stale entries periodically (every 5 minutes)
if (typeof globalThis !== 'undefined') {
  const cleanupInterval = 5 * 60 * 1000;
  const existingInterval = (globalThis as Record<string, unknown>).__rateLimitCleanup as ReturnType<typeof setInterval> | undefined;
  if (!existingInterval) {
    const interval = setInterval(() => {
      const now = Date.now();
      for (const [key, timestamps] of store.entries()) {
        const valid = timestamps.filter((t) => now - t < WINDOW_MS);
        if (valid.length === 0) {
          store.delete(key);
        } else {
          store.set(key, valid);
        }
      }
    }, cleanupInterval);
    (globalThis as Record<string, unknown>).__rateLimitCleanup = interval;
  }
}
