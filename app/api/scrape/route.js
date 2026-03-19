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
        message: "Invalid JSON body",
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

    // 🌐 Call external API
    const res = await fetch("https://rev-api-yoxt.onrender.com/scrape", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        session_data: session_data || {},
      }),
    });

    // 🔍 Handle non-200 responses
    if (!res.ok) {
      return Response.json({
        success: false,
        message: "External API failed",
        status: res.status,
      });
    }

    let data;
    try {
      data = await res.json();
    } catch {
      return Response.json({
        success: false,
        message: "Invalid response from external API",
      });
    }

    // 🔍 Validate API response
    if (!data || data.status !== "success") {
      return Response.json({
        success: false,
        message: data?.message || "Login failed",
        raw: data,
      });
    }

    // =========================
    // 🔥 NORMALIZE DATA HERE
    // =========================
    let normalized;
    try {
      normalized = normalizeData(data);
    } catch (err) {
      console.error("Normalization failed:", err);

      return Response.json({
        success: false,
        message: "Normalization failed",
        error: err.message,
        raw: data, // helpful for debugging
      });
    }

    // =========================
    // ✅ FINAL RESPONSE
    // =========================
    return Response.json({
      success: true,
      data: normalized,   // ✅ cleaned data for frontend
      raw: data,          // ⚠️ optional (remove in production if needed)
    });

  } catch (error) {
    console.error("Server error:", error);

    return Response.json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
}