"use client";

import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import AuthProvider from "@/components/auth/AuthProvider";
import MobileHeader from "@/components/layout/MobileHeader";
import BottomNav from "@/components/layout/BottomNav";
import ViewportFix from "@/components/layout/ViewportFix";

import { usePathname, useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { useEffect, useRef } from "react";

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  const isLoginPage = pathname === "/";
  const isSharePage = pathname === "/share";

  const {
    showLeaveModal,
    handleDiscardGlobal,
    handleStayGlobal,
  } = useAppStore();

  // =========================
  // 🔥 BODY SCROLL LOCK
  // =========================
  useEffect(() => {
    if (isSharePage) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isSharePage]);

  // =========================
  // 🔥 SWIPE NAVIGATION
  // =========================
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchEndX = useRef(0);
  const touchEndY = useRef(0);

  const routes = [
    "/attendance",
    "/marks",
    "/dashboard",
    "/timetable",
    "/planner",
  ];

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
  };

  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    touchEndX.current = touch.clientX;
    touchEndY.current = touch.clientY;
  };

  const handleTouchEnd = () => {
    // 🚫 Disable swipe on login/share
    if (isLoginPage || isSharePage) return;

    const dx = touchStartX.current - touchEndX.current;
    const dy = touchStartY.current - touchEndY.current;

    // 👉 Ignore vertical scrolls
    if (Math.abs(dx) < Math.abs(dy)) return;

    const threshold = 50;

    const currentIndex = routes.indexOf(pathname);
    if (currentIndex === -1) return;

    // 👉 Swipe LEFT → next
    if (dx > threshold) {
      const next = routes[currentIndex + 1];
      if (next) router.push(next);
    }

    // 👉 Swipe RIGHT → previous
    if (dx < -threshold) {
      const prev = routes[currentIndex - 1];
      if (prev) router.push(prev);
    }
  };

  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"
        />
      </head>

      <body>
        <AuthProvider>
          <ViewportFix />

          <div
            className="flex w-full overflow-hidden"
            style={{ height: "calc(var(--vh, 1vh) * 100)" }}
          >
            <Sidebar />

            <div className="flex flex-col flex-1 min-w-0">
              <MobileHeader />

              <main
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className={`
                  flex-1 bg-gray-100 min-w-0
                  ${
                    isLoginPage
                      ? "overflow-hidden pt-6 pb-6"
                      : isSharePage
                      ? "overflow-hidden p-0"
                      : "overflow-y-auto pt-20 md:pt-6 pb-24 md:pb-6 p-4 md:p-6"
                  }
                `}
              >
                {children}
              </main>
            </div>
          </div>

          {/* Hide bottom nav ONLY on share */}
          {!isSharePage && <BottomNav />}

          {/* GLOBAL MODAL */}
          {showLeaveModal && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[999]">
              <div className="bg-white p-5 rounded-xl w-80 shadow-lg">
                <h2 className="text-lg font-semibold mb-2">
                  Unsaved Changes
                </h2>

                <p className="text-sm text-gray-600 mb-4">
                  You have unsaved changes. Do you want to discard them?
                </p>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={handleStayGlobal}
                    className="px-3 py-1 rounded hover:bg-gray-100"
                  >
                    Stay
                  </button>

                  <button
                    onClick={handleDiscardGlobal}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Discard
                  </button>
                </div>
              </div>
            </div>
          )}
        </AuthProvider>
      </body>
    </html>
  );
}