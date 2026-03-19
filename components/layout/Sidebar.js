"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { loginUser } from "@/lib/api";
import { normalizeData } from "@/lib/normalize";
import {
  saveData,
  saveSession,
  getSession,
} from "@/lib/storage";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const {
    setData,
    setSession,
    credentials,
    setLoading,
    loading,
    clearAll,
  } = useAppStore();

  const links = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Attendance", href: "/attendance" },
    { name: "Marks", href: "/marks" },
    { name: "Subjects", href: "/subjects" },
    { name: "Timetable", href: "/timetable" },
    { name: "Planner", href: "/planner" },
  ];

  // 🔄 REFRESH (FIXED)
  const handleRefresh = async () => {
    try {
      // ❌ if credentials missing → force login
      if (!credentials?.email || !credentials?.password) {
        alert("Session expired. Please login again.");
        clearAll();
        localStorage.clear();
        router.replace("/");
        return;
      }

      setLoading(true);

      const session = getSession() || {};

      const raw = await loginUser(
        credentials.email,
        credentials.password,
        session
      );

      // ❌ API failed
      if (!raw || raw.status !== "success") {
        throw new Error("Refresh failed");
      }

      const normalized = normalizeData(raw);

      if (!normalized) {
        throw new Error("Data normalization failed");
      }

      // ✅ Update store
      setData(normalized);
      setSession(raw.session_data || {});

      // ✅ Persist
      saveSession(raw.session_data || {});
      saveData(normalized);

      // ✅ Force UI refresh (important)
      router.refresh();

    } catch (err) {
      console.error("Refresh error:", err);

      alert("Session expired or API failed. Please login again.");

      // 🔥 fallback reset
      clearAll();
      localStorage.clear();
      router.replace("/");

    } finally {
      setLoading(false);
    }
  };

  // 🚪 LOGOUT
  const handleLogout = async () => {
    try {
      await fetch("https://rev-api-yoxt.onrender.com/logout", {
        method: "POST",
      });
    } catch {
      console.warn("Logout API failed");
    }

    clearAll();
    localStorage.clear();
    router.replace("/");
  };

  return (
    <div className="w-60 h-screen bg-white border-r p-4 flex flex-col">

      {/* Title */}
      <h2 className="text-xl font-bold mb-6">
        Student Portal
      </h2>

      {/* Navigation */}
      <div className="flex flex-col gap-2 flex-1">
        {links.map((link) => {
          const active = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`p-2 rounded transition ${
                active
                  ? "bg-blue-500 text-white"
                  : "hover:bg-gray-100"
              }`}
            >
              {link.name}
            </Link>
          );
        })}
      </div>

      {/* 🔄 Refresh */}
      <button
        onClick={handleRefresh}
        disabled={loading}
        className="mt-2 bg-green-500 text-white p-2 rounded hover:bg-green-600 disabled:opacity-50"
      >
        {loading ? "Refreshing..." : "🔄 Refresh"}
      </button>

      {/* 🚪 Logout */}
      <button
        onClick={handleLogout}
        className="mt-2 bg-red-500 text-white p-2 rounded hover:bg-red-600"
      >
        🚪 Logout
      </button>

    </div>
  );
}