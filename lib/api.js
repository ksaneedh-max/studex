export async function loginUser(email, password, session = {}) {
  try {
    const res = await fetch(
      "https://rev-api-yoxt.onrender.com/scrape",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          session_data: session || {},
        }),
      }
    );

    const result = await res.json();

    // ✅ FIXED CONDITION
    if (!res.ok || result.status !== "success") {
      throw new Error(
        result?.message || "External API failed"
      );
    }

    return result;

  } catch (err) {
    console.error("API ERROR:", err);
    throw err;
  }
}