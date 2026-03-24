import { Redis } from "@upstash/redis";

// =========================
// 🔹 MAIN REDIS (App Data)
// =========================
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// =========================
// 🔹 SYSTEM REDIS (Analytics + Admin)
// =========================
export const systemRedis = new Redis({
  url: process.env.SYSTEM_REDIS_URL,
  token: process.env.SYSTEM_REDIS_TOKEN,
});