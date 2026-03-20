const rateMap = new Map<string, { count: number; resetAt: number }>();

export function isRateLimited(
  key: string,
  maxAttempts: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const entry = rateMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateMap.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  entry.count++;
  if (entry.count > maxAttempts) return true;
  return false;
}
