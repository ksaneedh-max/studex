export async function POST(req) {
  try {
    // =========================
    // 🔐 SAFE BODY PARSE
    // =========================
    let body;
    try {
      body = await req.json();
    } catch {
      return Response.json(
        { success: false, message: "Invalid request body" },
        { status: 400 }
      );
    }

    const { id, password } = body || {};

    // =========================
    // ❗ VALIDATION
    // =========================
    if (!id || !password) {
      return Response.json(
        { success: false, message: "Missing credentials" },
        { status: 400 }
      );
    }

    // =========================
    // 🔐 ENV VALIDATION
    // =========================
    const adminId = process.env.ADMIN_ID;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminId || !adminPassword) {
      return Response.json(
        {
          success: false,
          message: "Admin credentials not configured",
        },
        { status: 500 }
      );
    }

    const isValid =
      id === adminId &&
      password === adminPassword;

    if (!isValid) {
      return Response.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // =========================
    // ✅ SUCCESS
    // =========================
    return Response.json({
      success: true,
    });

  } catch (error) {
    console.error("Admin login error:", error);

    return Response.json(
      {
        success: false,
        message: "Login failed",
        error: error.message,
      },
      { status: 500 }
    );
  }
}