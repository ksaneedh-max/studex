"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import {
  getData,
  getSession,
  getLastFetch,
  saveSession,
  saveData,
} from "@/lib/storage";
import { loginUser } from "@/lib/api";

export default function AuthProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const {
    setData,
    setSession,
    credentials, // 🔥 needed for auto refresh
  } = useAppStore();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedData = getData();
    const session = getSession();
    const lastFetch = getLastFetch();

    const isValidSession =
      session && Object.keys(session).length > 0;

    const isLoggedIn = savedData && isValidSession;

    // 🔹 Restore store
    if (isLoggedIn) {
      setData(savedData);
      setSession(session);

      // 🔥 AUTO REFRESH LOGIC
      const now = Date.now();
      const isStale =
        !lastFetch || now - lastFetch > 3 * 60 * 1000; // 3 mins

      if (
        isStale &&
        credentials?.email &&
        credentials?.password
      ) {
        // 🔄 silent background refresh
        (async () => {
          try {
            const res = await loginUser(
              credentials.email,
              credentials.password,
              session
            );

            if (res?.success) {
              setData(res.data);

              if (
                res.session &&
                Object.keys(res.session).length > 0
              ) {
                setSession(res.session);
                saveSession(res.session);
              }

              saveData(res.data);
            }
          } catch {
            // ❌ silent fail (do not disturb user)
          }
        })();
      }
    }

    // 🔥 ROUTE CONTROL
    if (!isLoggedIn && pathname !== "/") {
      router.replace("/");
    }

    if (isLoggedIn && pathname === "/") {
      router.replace("/dashboard");
    }

    setLoading(false);
  }, [pathname, router, setData, setSession, credentials]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  return children;
}