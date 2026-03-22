import { normalizeData } from "@/lib/normalize";

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

    const { email, password, session_data } = body || {};

    // 🔍 Validation
    if (!email || !password) {
      return Response.json({
        success: false,
        message: "Email and password are required",
      });
    }

    // 🔹 Helper to call external API
    const callAPI = async (useSession = true) => {
      const requestBody = {
        email,
        password,
        ...(useSession &&
          session_data &&
          Object.keys(session_data).length > 0 && {
            session_data,
          }),
      };

      const res = await fetch(
        "https://rev-api-yoxt.onrender.com/scrape",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error("Invalid response from external server");
      }

      // 🔥 IMPORTANT: forward real backend errors
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

    // 🔹 STEP 1: Try session reuse
    try {
      data = await callAPI(true);
      reused = true;
    } catch {
      data = null;
    }

    // 🔹 STEP 2: Fallback to fresh login
    if (!data) {
      try {
        data = await callAPI(false);
        reused = false;
      } catch (err) {
        return Response.json({
          success: false,
          message:
            err.message ||
            "Invalid email or password",
        });
      }
    }

    // 🔍 Final validation
    if (!data) {
      return Response.json({
        success: false,
        message: "Login failed",
      });
    }

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
    // ✅ FINAL RESPONSE
    // =========================
    return Response.json({
      success: true,
      data: normalized,
      session: data.session_data || null,
      meta: {
        reused,
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