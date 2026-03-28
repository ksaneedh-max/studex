import { loginUser } from "./api";

let refreshingPromise = null;

export async function refreshSession(session_id) {
  if (!session_id) {
    return { success: false, logout: true };
  }

  // prevent duplicate calls
  if (refreshingPromise) return refreshingPromise;

  refreshingPromise = (async () => {
    try {
      const res = await loginUser({ session_id });

      return {
        success: true,
        data: res.data,
      };

    } catch (err) {
      // 🔴 hard logout
      if (err.code === "SESSION_EXPIRED") {
        return { success: false, logout: true };
      }

      // 🔁 retry once (for network issues)
      try {
        const retry = await loginUser({ session_id });

        return {
          success: true,
          data: retry.data,
        };
      } catch (retryErr) {
        return { success: false };
      }

    } finally {
      refreshingPromise = null;
    }
  })();

  return refreshingPromise;
}

export function logout(router) {
  localStorage.removeItem("session_id");
  localStorage.removeItem("app_data");
  localStorage.removeItem("last_fetch");

  if (router) router.replace("/");
}