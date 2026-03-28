export async function loginUser({ email, password, session_id }) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const body = session_id
      ? { session_id, type: "refresh" }
      : { email, password, type: "login" };

    const res = await fetch("/api/scrape", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    let result;
    try {
      result = await res.json();
    } catch {
      throw { code: "BAD_RESPONSE", message: "Invalid server response" };
    }

    if (!res.ok || !result?.success) {
      const msg = (result?.message || "").toLowerCase();

      if (res.status === 401 || msg.includes("expired")) {
        throw { code: "SESSION_EXPIRED", message: "Session expired" };
      }

      if (msg.includes("password")) {
        throw { code: "INVALID_PASSWORD", message: "Incorrect password" };
      }

      if (msg.includes("lookup")) {
        throw { code: "INVALID_EMAIL", message: "Invalid email" };
      }

      if (msg.includes("timeout")) {
        throw { code: "TIMEOUT", message: "Server busy, try again" };
      }

      throw { code: "UNKNOWN", message: "Login failed" };
    }

    return result;

  } catch (err) {
    if (err.name === "AbortError") {
      throw { code: "TIMEOUT", message: "Request timeout" };
    }

    if (err.code) throw err;

    throw { code: "NETWORK", message: "Network error" };
  } finally {
    clearTimeout(timeout);
  }
}