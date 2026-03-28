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

let refreshingPromise = null;

export default function AuthProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const { setData, setLoading } = useAppStore();

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    const refreshSession = async (session_id) => {
      // 🚫 prevent duplicate refresh calls
      if (refreshingPromise) return refreshingPromise;

      refreshingPromise = (async () => {
        try {
          const res = await loginUser({ session_id });

          return {
            success: true,
            data: res.data,
            relogin: res?.meta?.relogin || false,
          };

        } catch (err) {
          // 🔴 logout if session expired
          if (err.code === "SESSION_EXPIRED") {
            return { success: false, logout: true };
          }

          // 🔁 retry once (network / timeout)
          try {
            const retry = await loginUser({ session_id });

            return {
              success: true,
              data: retry.data,
              relogin: retry?.meta?.relogin || false,
            };
          } catch {
            return { success: false };
          }

        } finally {
          refreshingPromise = null;
        }
      })();

      return refreshingPromise;
    };

    const init = async () => {
      const savedData = getData();
      const session_id = localStorage.getItem("session_id");
      const lastFetch = getLastFetch();

      let isLoggedIn = !!session_id;

      // =========================
      // 🔹 Restore cached state
      // =========================
      if (isLoggedIn && savedData && mounted) {
        setData(savedData);
      }

      // =========================
      // 🔥 AUTO REFRESH (SAFE)
      // =========================
      if (isLoggedIn) {
        const now = Date.now();
        const isStale =
          !lastFetch || now - lastFetch > 2 * 60 * 1000;

        if (isStale) {
          setLoading(true);

          const result = await refreshSession(session_id);

          if (!mounted) return;

          if (result.success) {
            if (result.relogin) {
              console.log("🔐 Auto: Re-logged in (session expired)");
            } else {
              console.log("🔄 Auto: Session reused");
            }

            setData(result.data);
            saveData(result.data);

          } else if (result.logout) {
            console.log("❌ Session expired → logging out");

            localStorage.removeItem("session_id");
            localStorage.removeItem("app_data");
            localStorage.removeItem("last_fetch");

            isLoggedIn = false;

          } else {
            console.log("⚠️ Temporary refresh failure (keeping session)");
          }

          setLoading(false);
        }
      }

      // =========================
      // 🔐 ROUTE CONTROL (AFTER REFRESH)
      // =========================
      const isApiRoute = pathname.startsWith("/api");

      if (!isLoggedIn && pathname !== "/" && !isApiRoute) {
        router.replace("/");
      }

      if (isLoggedIn && pathname === "/") {
        router.replace("/dashboard");
      }

      if (mounted) setIsReady(true);
    };

    init();

    return () => {
      mounted = false;
    };
  }, [pathname, router, setData, setLoading]);

  // =========================
  // ⏳ LOADING SCREEN
  // =========================
  if (!isReady) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100 animate-fadeIn">

        {/* 🔥 APP NAME */}
        <h1 className="text-3xl md:text-4xl font-bold tracking-wide mb-4 animate-pulse">
          Academia DeX
        </h1>

        {/* 🔄 SPINNER */}
        <div className="w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>

        {/* 🔵 DOT LOADER */}
        <div className="flex gap-1 mt-4">
          <div className="w-2 h-2 bg-black rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-black rounded-full animate-bounce [animation-delay:0.2s]"></div>
          <div className="w-2 h-2 bg-black rounded-full animate-bounce [animation-delay:0.4s]"></div>
        </div>

        {/* 📝 TEXT */}
        <p className="mt-4 text-sm text-gray-500">
          Checking session...
        </p>

      </div>
    );
  }

  return children;
}