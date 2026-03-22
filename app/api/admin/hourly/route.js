import { redis } from "@/lib/redis";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const date =
      searchParams.get("date") ||
      new Date().toISOString().slice(0, 10);

    const cacheKey = `cache:hourly:${date}`;

    // =========================
    // 🔥 CHECK CACHE
    // =========================
    const cached = await redis.get(cacheKey);
    if (cached) {
      return Response.json({
        success: true,
        data: cached,
        cached: true,
      });
    }

    // =========================
    // 🔥 COMPUTE (UPDATED)
    // =========================
    const hours = Array.from({ length: 24 }, (_, i) => i);

    const data = await Promise.all(
      hours.map(async (hour) => {
        const key = `stats:hourly:${date}:${hour}`;

        // 🔥 CHANGE: SCARD → GET
        const count = await redis.get(key);

        return {
          hour,
          users: Number(count || 0),
        };
      })
    );

    // =========================
    // 🔥 STORE CACHE (1 min)
    // =========================
    await redis.set(cacheKey, data, {
      ex: 60,
    });

    return Response.json({
      success: true,
      data,
      cached: false,
    });

  } catch (error) {
    return Response.json({
      success: false,
      message: "Failed to fetch hourly analytics",
    });
  }
}