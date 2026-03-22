export async function loginUser({ email, password, session_id }) {
  try {
    // =========================
    // 🔹 Build request body
    // =========================
    const body = session_id
      ? { session_id } // 🔥 refresh case
      : { email, password }; // 🔐 first login

    // =========================
    // 🔹 Call internal API
    // =========================
    const res = await fetch("/api/scrape", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    let result;
    try {
      result = await res.json();
    } catch {
      throw new Error("Server error. Please try again.");
    }

    // =========================
    // 🔥 ERROR HANDLING
    // =========================
    if (!res.ok || !result?.success) {
      let message =
        result?.message ||
        result?.detail ||
        "Invalid email or password";

      const lower = message.toLowerCase();

      if (lower.includes("lookup failed")) {
        message = "Invalid email address";
      } else if (lower.includes("password")) {
        message = "Incorrect password";
      } else if (lower.includes("timeout")) {
        message = "Server is busy. Please try again.";
      } else if (lower.includes("expired")) {
        message = "Session expired. Please login again.";
      }

      throw new Error(message);
    }

    return result;

  } catch (err) {
    console.error("API ERROR:", err);
    throw err;
  }
}