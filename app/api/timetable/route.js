import { redis } from "@/lib/redis";

const TTL = 60 * 60 * 24 * 7; // 7 days

// ✅ SAVE overrides
export async function POST(req) {
  try {
    const { session_id, overrides } = await req.json();

    if (!session_id) {
      return Response.json({ success: false, message: "Missing session_id" });
    }

    // 🔐 Validate session exists
    const session = await redis.get(session_id);
    if (!session) {
      return Response.json({
        success: false,
        message: "Invalid session",
      });
    }

    await redis.set(`timetable:${session_id}`, overrides, {
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

// ✅ LOAD overrides
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const session_id = searchParams.get("session_id");

    if (!session_id) {
      return Response.json({ success: false });
    }

    const overrides = await redis.get(`timetable:${session_id}`);

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