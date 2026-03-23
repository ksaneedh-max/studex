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

  const { setData, setLoading } = useAppStore();

  // ✅ NEW: readiness state (prevents premature redirect)
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      const savedData = getData();
      const session_id = localStorage.getItem("session_id");
      const lastFetch = getLastFetch();

      // 🔥 session_id is source of truth
      const isLoggedIn = !!session_id;

      // =========================
      // 🔹 Restore state
      // =========================
      if (isLoggedIn && savedData) {
        setData(savedData);
      }

      // =========================
      // 🔥 AUTO REFRESH
      // =========================
      if (isLoggedIn) {
        const now = Date.now();
        const isStale =
          !lastFetch || now - lastFetch > 2 * 60 * 1000; // 2 mins

        if (isStale) {
          try {
            setLoading(true);

            const res = await loginUser({ session_id });

            if (res?.success) {
              if (res?.meta?.relogin) {
                console.log("🔐 Auto: Re-logged in (session expired)");
              } else {
                console.log("🔄 Auto: Session reused");
              }

              setData(res.data);
              saveData(res.data);
            } else {
              throw new Error("Session invalid");
            }

          } catch (err) {
            // ❗ DO NOT logout immediately
            console.log("⚠️ Refresh failed, keeping session");
          } finally {
            setLoading(false);
          }
        }
      }

      // =========================
      // 🔐 ROUTE CONTROL (AFTER CHECK)
      // =========================
      const isApiRoute = pathname.startsWith("/api");

      if (!isLoggedIn && pathname !== "/" && !isApiRoute) {
        router.replace("/");
      }

      if (isLoggedIn && pathname === "/") {
        router.replace("/dashboard");
      }

      // ✅ mark ready AFTER everything
      setIsReady(true);
    };

    init();
  }, [pathname, router, setData, setLoading]);

  // =========================
  // ⏳ BLOCK UI UNTIL READY
  // =========================
  if (!isReady) {
    return (
      <div className="flex items-center justify-center h-screen">
        Checking session...
      </div>
    );
  }

  return children;
}