import { Redis } from '@upstash/redis';

// Singleton Redis client — reads UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
// from environment variables (set in Vercel dashboard or .env.local).
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/** TTL in seconds: 90 days */
export const ROOM_TTL = 60 * 60 * 24 * 90;
