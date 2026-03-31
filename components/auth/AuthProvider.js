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

// ✅ NEW: use global toast
import { useToast } from "@/components/toast/ToastProvider";

let refreshingPromise = null;

export default function AuthProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const { setData, setLoading } = useAppStore();

  const { showToast } = useToast(); // ✅ use global toast

  const [isReady, setIsReady] = useState(false);

  // 🧠 Queue (still needed for reload animation fix)
  const [pendingToast, setPendingToast] = useState(null);

  useEffect(() => {
    let mounted = true;

    const refreshSession = async (session_id) => {
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
          if (err.code === "SESSION_EXPIRED") {
            return { success: false, logout: true };
          }

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
              setPendingToast({
                message: "Data fetched",
                type: "info",
              });
            } else {
              console.log("🔄 Auto: Session reused");
              setPendingToast({
                message: "Data refreshed",
                type: "success",
              });
            }

            setData(result.data);
            saveData(result.data);

          } else if (result.logout) {
            console.log("❌ Session expired → logging out");

            // 🔴 ONLY ADDITION (red toast)
            setPendingToast({
              message: "Session expired. Please login again",
              type: "error",
            });

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
      // 🔐 ROUTE CONTROL
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
  // ✅ FIRE TOAST AFTER READY (CRITICAL FIX)
  // =========================
  useEffect(() => {
    if (isReady && pendingToast) {
      setTimeout(() => {
        showToast(pendingToast.message, pendingToast.type);
      }, 150);

      setPendingToast(null);
    }
  }, [isReady, pendingToast, showToast]);

  // =========================
  // ⏳ LOADING SCREEN
  // =========================
  if (!isReady) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100 animate-fadeIn">

        <h1 className="text-3xl md:text-4xl font-bold tracking-wide mb-4 animate-pulse">
          Academia DeX
        </h1>

        <div className="w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>

        <div className="flex gap-1 mt-4">
          <div className="w-2 h-2 bg-black rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-black rounded-full animate-bounce [animation-delay:0.2s]"></div>
          <div className="w-2 h-2 bg-black rounded-full animate-bounce [animation-delay:0.4s]"></div>
        </div>

        <p className="mt-4 text-sm text-gray-500">
          Checking session...
        </p>

      </div>
    );
  }

  return children;
}