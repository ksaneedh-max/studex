export async function loginUser(email, password, session) {
  try {
    // 🔹 Build request body
    const body = {
      email,
      password,
      ...(session &&
        Object.keys(session).length > 0 && { session_data: session }),
    };

    // 🔹 Call your internal API
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

    // 🔥 IMPROVED ERROR HANDLING + UX CLEANUP
    if (!res.ok || !result?.success) {
      let message =
        result?.message ||
        result?.detail ||
        "Invalid email or password";

      // 🔹 Clean backend messages
      const lower = message.toLowerCase();

      if (lower.includes("lookup failed")) {
        message = "Invalid email address";
      } else if (lower.includes("password")) {
        message = "Incorrect password";
      } else if (lower.includes("timeout")) {
        message = "Server is busy. Please try again.";
      }

      throw new Error(message);
    }

    return result;

  } catch (err) {
    console.error("API ERROR:", err);
    throw err;
  }
}