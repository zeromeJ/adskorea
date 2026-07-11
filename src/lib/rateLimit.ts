type RateRecord = {
  count: number;
  resetAt: number;
};

const records = new Map<string, RateRecord>();

export function isRateLimited(key: string, limit = 10, windowMs = 60_000) {
  const now = Date.now();
  const current = records.get(key);

  if (!current || current.resetAt < now) {
    records.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  current.count += 1;
  records.set(key, current);

  return current.count > limit;
}
