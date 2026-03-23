"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { loginUser } from "@/lib/api";
import {
  saveData,
  clearStorage,
} from "@/lib/storage";
import { useState, useEffect } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  // ✅ ALWAYS declare hooks first
  const [open, setOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const {
    setData,
    setLoading,
    loading,
    clearAll,
  } = useAppStore();

  // ✅ NOW safe to conditionally render
  if (pathname === "/") return null;

  const mainLinks = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Attendance", href: "/attendance" },
    { name: "Marks", href: "/marks" },
    { name: "Timetable", href: "/timetable" },
    { name: "Planner", href: "/planner" },
  ];

  const toolLinks = [
    { name: "Course List", href: "/subjects" },
    { name: "Skip Planner", href: "/skip-planner" },
  ];

  useEffect(() => {
    const openSidebar = () => setOpen(true);
    document.addEventListener("toggle-sidebar", openSidebar);
    return () => {
      document.removeEventListener("toggle-sidebar", openSidebar);
    };
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  /* ---------- REFRESH ---------- */
  const handleRefresh = async () => {
    try {
      const session_id = localStorage.getItem("session_id");

      if (!session_id) {
        alert("Session expired. Please login again.");
        handleLogout();
        return;
      }

      setLoading(true);

      const res = await loginUser({ session_id });

      if (!res || !res.success) {
        throw new Error("Refresh failed");
      }

      if (res?.meta?.relogin) {
        console.log("🔐 Re-logged in (session expired)");
      } else {
        console.log("🔄 Session refreshed (reused)");
      }

      setData(res.data);
      saveData(res.data);

      router.refresh();
    } catch {
      alert("Session expired. Please login again.");
      handleLogout();
    } finally {
      setLoading(false);
    }
  };

  /* ---------- LOGOUT ---------- */
  const handleLogout = async () => {
    try {
      const session_id = localStorage.getItem("session_id");

      if (session_id) {
        await fetch("/api/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ session_id }),
        });
      }
    } catch {}

    clearAll();
    clearStorage();
    localStorage.removeItem("session_id");

    router.replace("/");
  };

  const renderLink = (link) => {
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
        className={`fixed md:static top-0 left-0 h-full w-64 bg-white border-r flex flex-col z-50 transform transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        {/* Header */}
        <div className="p-4 border-b">
          <h2 className="text-lg font-bold tracking-tight">
            Academia DeX
          </h2>
        </div>

        {/* Links */}
        <div className="flex flex-col p-3 flex-1 space-y-4 pt-6">
          <div>
            <p className="text-xs text-gray-400 mb-1">MAIN</p>
            {mainLinks.map(renderLink)}
          </div>

          <div>
            <p className="text-xs text-gray-400 mb-1">TOOLS</p>
            {toolLinks.map(renderLink)}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t space-y-2 pb-20 md:pb-3 bg-white">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="w-full bg-green-500 text-white py-2 rounded"
          >
            {loading ? "Refreshing..." : "🔄 Refresh"}
          </button>

          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full bg-red-500 text-white py-2 rounded"
          >
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Logout Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[90%] max-w-sm shadow-lg text-center space-y-4">
            <h2 className="text-lg font-semibold">
              Confirm Logout
            </h2>

            <p className="text-sm text-gray-500">
              Are you sure you want to logout?
            </p>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  handleLogout();
                }}
                className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}