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

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      const savedData = getData();
      const session_id = localStorage.getItem("session_id");
      const lastFetch = getLastFetch();

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
          !lastFetch || now - lastFetch > 2 * 60 * 1000;

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
            console.log("⚠️ Refresh failed, keeping session");
          } finally {
            setLoading(false);
          }
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

      setIsReady(true);
    };

    init();
  }, [pathname, router, setData, setLoading]);

  // =========================
  // ⏳ LOADING SCREEN (UPGRADED)
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