import { systemRedis } from "@/lib/redis";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    // =========================
    // 🔥 IST DATE (CONSISTENT)
    // =========================
    const getISTDate = () => {
      return new Date(
        new Date().toLocaleString("en-US", {
          timeZone: "Asia/Kolkata",
        })
      )
        .toISOString()
        .slice(0, 10);
    };

    const date =
      searchParams.get("date") || getISTDate();

    const hours = Array.from({ length: 24 }, (_, i) => i);

    // =========================
    // 🔥 SIMPLE + RELIABLE FETCH
    // =========================
    const data = await Promise.all(
      hours.map(async (hour) => {
        const key = `hourly:users:${date}:${hour}`;

        let users = {};

        try {
          const res = await systemRedis.hgetall(key);

          if (res && typeof res === "object") {
            users = res;
          }
        } catch (err) {
          console.error(`Error fetching ${key}:`, err);
          users = {};
        }

        return {
          hour,
          count: Object.keys(users).length,
          users, // { email: name }
        };
      })
    );

    return Response.json({
      success: true,
      data,
    });

  } catch (error) {
    console.error("Analytics fetch error:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to fetch analytics",
        error: error.message,
      },
      { status: 500 }
    );
  }
}