import { prisma } from "@/lib/prisma";

type CacheShape = {
  checkedAt: number;
  healthy: boolean;
};

const globalCache = globalThis as unknown as { dbHealthCache?: CacheShape };

export async function canReachDatabase() {
  const now = Date.now();
  const cache = globalCache.dbHealthCache;
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (!databaseUrl) {
    globalCache.dbHealthCache = { checkedAt: now, healthy: false };
    return false;
  }

  // Avoid hammering a down DB on every request.
  if (cache && now - cache.checkedAt < 10000) {
    return cache.healthy;
  }

  try {
    await prisma.$queryRaw`SELECT 1`;

    // A live connection is not enough; ensure critical tables exist.
    const tableCheck = await prisma.$queryRaw<Array<{ blog_table: string | null; category_table: string | null }>>`
      SELECT
        to_regclass('public."Blog"')::text AS blog_table,
        to_regclass('public."Category"')::text AS category_table
    `;
    const hasBlog = tableCheck[0]?.blog_table === 'public."Blog"';
    const hasCategory = tableCheck[0]?.category_table === 'public."Category"';
    if (!hasBlog || !hasCategory) {
      console.error("DB_SCHEMA_MISSING", { hasBlog, hasCategory });
      globalCache.dbHealthCache = { checkedAt: now, healthy: false };
      return false;
    }

    globalCache.dbHealthCache = { checkedAt: now, healthy: true };
    return true;
  } catch (error) {
    console.error("DB_HEALTH_CHECK_FAILED", error);
    globalCache.dbHealthCache = { checkedAt: now, healthy: false };
    return false;
  }
}
