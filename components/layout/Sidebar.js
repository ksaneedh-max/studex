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
import { useState, useEffect } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [open, setOpen] = useState(false);

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

  /* ---------- OPEN FROM HEADER ---------- */
  useEffect(() => {
    const openSidebar = () => setOpen(true);
    document.addEventListener("toggle-sidebar", openSidebar);
    return () => {
      document.removeEventListener("toggle-sidebar", openSidebar);
    };
  }, []);

  /* ---------- CLOSE ON ROUTE ---------- */
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  /* ---------- REFRESH ---------- */
  const handleRefresh = async () => {
    try {
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

      if (!raw || raw.status !== "success") {
        throw new Error("Refresh failed");
      }

      const normalized = normalizeData(raw);

      setData(normalized);
      setSession(raw.session_data || {});
      saveSession(raw.session_data || {});
      saveData(normalized);

      router.refresh();
    } catch {
      alert("Session expired. Please login again.");
      clearAll();
      localStorage.clear();
      router.replace("/");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- LOGOUT ---------- */
  const handleLogout = async () => {
    try {
      await fetch("https://rev-api-yoxt.onrender.com/logout", {
        method: "POST",
      });
    } catch {}

    clearAll();
    localStorage.clear();
    router.replace("/");
  };

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed md:static top-0 left-0 h-full w-64 bg-white border-r
          flex flex-col z-50
          transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* Header */}
        <div className="p-4 border-b">
          <h2 className="text-lg font-bold tracking-tight">
            Academia DeX
          </h2>
          <p className="text-xs text-gray-500">
            Navigation
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-col gap-1 p-3 flex-1 overflow-y-auto pb-6">
          {links.map((link) => {
            const active = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`
                  flex items-center justify-between
                  px-3 py-2 rounded-lg text-sm font-medium
                  transition-all
                  ${
                    active
                      ? "bg-blue-500 text-white shadow-sm"
                      : "text-gray-700 hover:bg-gray-100"
                  }
                `}
              >
                {link.name}

                {active && <span className="text-xs">●</span>}
              </Link>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t space-y-2 pb-24 md:pb-3 bg-white">

          {/* Refresh */}
          <button
            onClick={() => {
              setOpen(false);
              handleRefresh();
            }}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-green-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "🔄 Refresh"}
          </button>

          {/* Logout */}
          <button
            onClick={() => {
              setOpen(false);
              handleLogout();
            }}
            className="w-full flex items-center justify-center gap-2 bg-red-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition"
          >
            🚪 Logout
          </button>

        </div>
      </div>
    </>
  );
}