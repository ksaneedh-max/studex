import { redis } from "@/lib/redis";

const TTL = 60 * 60 * 24 * 7; // 7 days

// =========================
// ✅ SAVE overrides
// =========================
export async function POST(req) {
  try {
    const { session_id, overrides } = await req.json();

    if (!session_id) {
      return Response.json({
        success: false,
        message: "Missing session_id",
      });
    }

    // 🔐 Validate session
    const session = await redis.get(session_id);

    if (!session || !session.email) {
      return Response.json({
        success: false,
        message: "Invalid session",
      });
    }

    // ✅ Use email as key (FIX)
    const key = `timetable:${session.email}`;

    await redis.set(key, overrides, {
      ex: TTL,
    });

    return Response.json({ success: true });

  } catch (err) {
    return Response.json({
      success: false,
      message: "Failed to save",
      error: err.message,
    });
  }
}

// =========================
// ✅ LOAD overrides
// =========================
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const session_id = searchParams.get("session_id");

    if (!session_id) {
      return Response.json({ success: false });
    }

    // 🔐 Validate session
    const session = await redis.get(session_id);

    if (!session || !session.email) {
      return Response.json({ success: false });
    }

    // ✅ Use email as key (FIX)
    const key = `timetable:${session.email}`;

    const overrides = await redis.get(key);

    return Response.json({
      success: true,
      overrides: overrides || {},
    });

  } catch (err) {
    return Response.json({
      success: false,
      error: err.message,
    });
  }
}