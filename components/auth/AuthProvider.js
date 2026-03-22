"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import {
  getData,
  getLastFetch,
  saveData,
} from "@/lib/storage";
import { loginUser } from "@/lib/api";

export default function AuthProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const {
    setData,
    setLoading,
  } = useAppStore();

  const [loading, setPageLoading] = useState(true);

  useEffect(() => {
    const savedData = getData();
    const session_id = localStorage.getItem("session_id");
    const lastFetch = getLastFetch();

    const isLoggedIn = savedData && session_id;

    // =========================
    // 🔹 Restore state
    // =========================
    if (isLoggedIn) {
      setData(savedData);

      // 🔥 AUTO REFRESH (session_id based)
      const now = Date.now();
      const isStale =
        !lastFetch || now - lastFetch > 2 * 60 * 1000; // 2 mins

      if (isStale) {
        (async () => {
          try {
            setLoading(true);

            const res = await loginUser({ session_id });

            if (!res || !res.success) {
              throw new Error("Session expired");
            }

            // 🔥 NEW: CONSOLE MESSAGE
            if (res?.meta?.relogin) {
              console.log("🔐 Auto: Re-logged in (session expired)");
            } else {
              console.log("🔄 Auto: Session reused");
            }

            setData(res.data);
            saveData(res.data);

          } catch {
            // 🔥 if refresh fails → logout
            console.log("❌ Auto refresh failed → logging out");

            localStorage.removeItem("session_id");
            router.replace("/");
          } finally {
            setLoading(false);
          }
        })();
      }
    }

    // =========================
    // 🔥 ROUTE CONTROL
    // =========================
    const isApiRoute = pathname.startsWith("/api");

    if (!isLoggedIn && pathname !== "/" && !isApiRoute) {
      router.replace("/");
    }

    if (isLoggedIn && pathname === "/") {
      router.replace("/dashboard");
    }

    setPageLoading(false);
  }, [pathname, router, setData, setLoading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  return children;
}