import { normalizeData } from "@/lib/normalize";
import { redis } from "@/lib/redis";
import { nanoid } from "nanoid";

export async function POST(req) {
  try {
    // 🔐 Parse request safely
    let body;
    try {
      body = await req.json();
    } catch {
      return Response.json({
        success: false,
        message: "Invalid request body",
      });
    }

    const { email, password, session_data, session_id } = body || {};

    // =========================
    // 🔥 STEP 1: GET CREDS FROM REDIS
    // =========================
    let creds = null;

    if (session_id) {
      creds = await redis.get(session_id);

      if (!creds) {
        return Response.json({
          success: false,
          message: "Session expired. Please login again.",
        });
      }
    }

    // =========================
    // 🔥 STEP 2: RESOLVE FINAL VALUES
    // =========================
    const finalEmail = email || creds?.email;
    const finalPassword = password || creds?.password;
    const finalSession = session_data || creds?.session_data;

    if (!finalEmail || !finalPassword) {
      return Response.json({
        success: false,
        message: "Email and password are required",
      });
    }

    const previousDigest = finalSession?.digest || null;

    // =========================
    // 🔹 Helper to call external API
    // =========================
    const callAPI = async (useSession = true) => {
      const requestBody = {
        email: finalEmail,
        password: finalPassword,
        ...(useSession &&
          finalSession &&
          Object.keys(finalSession).length > 0 && {
            session_data: finalSession,
          }),
      };

      const res = await fetch(
        "https://rev-api-yoxt.onrender.com/scrape",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        }
      );

      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error("Invalid response from external server");
      }

      if (!res.ok || data?.detail) {
        throw new Error(
          data?.detail ||
          data?.message ||
          "Invalid email or password"
        );
      }

      return data;
    };

    let data;
    let reused = false;

    // =========================
    // 🔹 STEP 3: Try session reuse
    // =========================
    try {
      data = await callAPI(true);
      reused = true;
    } catch {
      data = null;
    }

    // =========================
    // 🔹 STEP 4: Fallback login
    // =========================
    if (!data) {
      try {
        data = await callAPI(false);
        reused = false;
      } catch (err) {
        return Response.json({
          success: false,
          message: err.message || "Invalid email or password",
        });
      }
    }

    if (!data) {
      return Response.json({
        success: false,
        message: "Login failed",
      });
    }

    // =========================
    // 🔥 RELLOGIN DETECTION
    // =========================
    const newDigest = data?.session_data?.digest || null;

    const relogin =
      previousDigest &&
      newDigest &&
      previousDigest !== newDigest;

    // =========================
    // 🔥 NORMALIZE DATA
    // =========================
    let normalized;
    try {
      normalized = normalizeData(data);
    } catch (err) {
      console.error("Normalization failed:", err);

      return Response.json({
        success: false,
        message: "Data processing failed",
        error: err.message,
      });
    }

    // =========================
    // 🔥 STEP 5: SESSION STORAGE
    // =========================
    const newSessionId = session_id || nanoid();
    const TTL = 60 * 60 * 24; // 24h

    const shouldWrite = relogin || !session_id;

    if (shouldWrite) {
      await redis.set(
        newSessionId,
        {
          email: finalEmail,
          password: finalPassword,
          session_data: data.session_data,
        },
        { ex: TTL }
      );

      console.log("💾 Session stored");
    } else {
      console.log("♻️ Session reused");
    }

    // =========================
    // 🔥 STEP 6: OPTIMIZED ANALYTICS (NEW)
    // =========================

    // 🔹 10-min limiter
    const trackKey = `track:${newSessionId}`;
    const alreadyTracked = await redis.get(trackKey);

    if (!alreadyTracked) {
      await redis.set(trackKey, "1", { ex: 600 }); // 10 minutes

      const now = new Date();
      const date = now.toISOString().slice(0, 10);
      const hour = now.getHours();

      const key = `stats:hourly:${date}:${hour}`;

      // 🔥 ONLY 1 WRITE
      await redis.incr(key);
    }

    // =========================
    // ✅ FINAL RESPONSE
    // =========================
    return Response.json({
      success: true,
      data: normalized,
      session_id: newSessionId,
      meta: {
        reused,
        relogin,
      },
    });

  } catch (error) {
    console.error("Server error:", error);

    return Response.json({
      success: false,
      message: "Server error. Please try again.",
      error: error.message,
    });
  }
}