"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { getData, getSession } from "@/lib/storage";

export default function AuthProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const { setData, setSession } = useAppStore();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedData = getData();
    const session = getSession();

    const isLoggedIn = savedData && session;

    // restore store
    if (isLoggedIn) {
      setData(savedData);
      setSession(session);
    }

    // 🔥 ROUTE CONTROL
    if (!isLoggedIn && pathname !== "/") {
      router.replace("/");
    }

    if (isLoggedIn && pathname === "/") {
      router.replace("/dashboard");
    }

    setLoading(false);
  }, [pathname, router, setData, setSession]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  return children;
}