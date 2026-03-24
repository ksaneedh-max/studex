import { normalizeData } from "@/lib/normalize";
import { redis, systemRedis } from "@/lib/redis";
import { nanoid } from "nanoid";

export async function POST(req) {
  try {
    // =========================
    // 🔐 SAFE BODY PARSE
    // =========================
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
    // 🔥 STEP 1: SESSION FETCH
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
    // 🔥 STEP 2: FINAL VALUES
    // =========================
    const finalEmailRaw = email ?? creds?.email;
    const finalPassword = password ?? creds?.password;
    const finalSession = session_data ?? creds?.session_data;

    if (!finalEmailRaw || !finalPassword) {
      return Response.json({
        success: false,
        message: "Email and password are required",
      });
    }

    const previousDigest = finalSession?.digest || null;

    // =========================
    // 🔹 API CALL HELPER
    // =========================
    const callAPI = async (useSession = true) => {
      const requestBody = {
        email: finalEmailRaw,
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
    // 🔹 STEP 3: REUSE SESSION
    // =========================
    if (finalSession && Object.keys(finalSession).length > 0) {
      try {
        data = await callAPI(true);
        reused = true;
      } catch {
        data = null;
      }
    }

    // =========================
    // 🔹 STEP 4: FALLBACK LOGIN
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
    const TTL = 60 * 60 * 24;

    const shouldWrite = relogin || !session_id;

    if (shouldWrite) {
      await redis.set(
        newSessionId,
        {
          email: finalEmailRaw,
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
    // 🔥 STEP 6: ACTIVE ANALYTICS
    // =========================
    let safeEmail = null;

    if (typeof finalEmailRaw === "string") {
      const trimmed = finalEmailRaw.trim();
      if (trimmed.includes("@")) {
        safeEmail = trimmed;
      }
    }

    if (!safeEmail && typeof creds?.email === "string") {
      const trimmed = creds.email.trim();
      if (trimmed.includes("@")) {
        safeEmail = trimmed;
      }
    }

    if (!safeEmail) {
      console.error("❌ Invalid email for analytics:", finalEmailRaw);
    }

    const name =
      data?.attendance?.student_info?.name ||
      safeEmail ||
      "Unknown";

    const safeName = String(name).trim();

    const now = new Date(
      new Date().toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
      })
    );

    const date = now.toISOString().slice(0, 10);
    const hour = now.getHours();

    const analyticsKey = `hourly:users:${date}:${hour}`;
    const trackKey = `track:hourly:${date}:${hour}:${safeEmail}`;

    if (safeEmail) {
      // Only count once per user per hour
      const alreadyTracked = await systemRedis.get(trackKey);

      if (!alreadyTracked) {
        await systemRedis.hset(analyticsKey, {
          [safeEmail]: safeName,
        });

        // Set analytics TTL only once (1 year)
        const ttl = await systemRedis.ttl(analyticsKey);
        if (ttl === -1) {
          await systemRedis.expire(
            analyticsKey,
            60 * 60 * 24 * 365
          );
        }

        // Mark this user as tracked for this hour
        await systemRedis.set(trackKey, "1", {
          ex: 60 * 60,
        });

        console.log("📊 Tracked active user:", safeEmail);
      } else {
        console.log("⏭️ Already tracked this hour:", safeEmail);
      }
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
