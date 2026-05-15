import { prisma } from "@/lib/prisma";

type CacheShape = {
  checkedAt: number;
  healthy: boolean;
};

const globalCache = globalThis as unknown as { dbHealthCache?: CacheShape };

export async function canReachDatabase() {
  const now = Date.now();
  const cache = globalCache.dbHealthCache;

  // Avoid hammering a down DB on every request.
  if (cache && now - cache.checkedAt < 10000) {
    return cache.healthy;
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    globalCache.dbHealthCache = { checkedAt: now, healthy: true };
    return true;
  } catch (error) {
    console.error("DB_HEALTH_CHECK_FAILED", error);
    globalCache.dbHealthCache = { checkedAt: now, healthy: false };
    return false;
  }
}