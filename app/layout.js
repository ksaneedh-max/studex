"use client";

import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import AuthProvider from "@/components/auth/AuthProvider";
import MobileHeader from "@/components/layout/MobileHeader";
import BottomNav from "@/components/layout/BottomNav";
import ViewportFix from "@/components/layout/ViewportFix";

import { usePathname, useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { useEffect, useRef, useState } from "react";

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
    document.body.style.overflow = isSharePage ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [isSharePage]);

  // =========================
  // 🔥 SWIPE STATE
  // =========================
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchCurrentX = useRef(0);
  const touchStartTime = useRef(0);

  const [swipeX, setSwipeX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  const routes = [
    "/attendance",
    "/marks",
    "/dashboard",
    "/timetable",
    "/planner",
  ];

  const THRESHOLD = 60;
  const VELOCITY_THRESHOLD = 0.5;

  // =========================
  // 🔥 RESET ON ROUTE CHANGE (CRITICAL FIX)
  // =========================
  useEffect(() => {
    setSwipeX(0);
    setIsSwiping(false);
  }, [pathname]);

  // =========================
  // 🔥 TOUCH START
  // =========================
  const handleTouchStart = (e) => {
    if (e.target.closest("[data-swipe-lock]")) return;
    if (isLoginPage || isSharePage) return;

    const touch = e.touches[0];

    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
    touchCurrentX.current = touch.clientX;
    touchStartTime.current = Date.now();

    setIsSwiping(true);
  };

  // =========================
  // 🔥 TOUCH MOVE
  // =========================
  const handleTouchMove = (e) => {
    if (!isSwiping) return;

    const touch = e.touches[0];

    const dx = touch.clientX - touchStartX.current;
    const dy = touch.clientY - touchStartY.current;

    // 🚫 ignore vertical scroll
    if (Math.abs(dx) < Math.abs(dy)) return;

    touchCurrentX.current = touch.clientX;

    // smooth drag
    setSwipeX(dx * 0.5);
  };

  // =========================
  // 🔥 TOUCH END
  // =========================
  const handleTouchEnd = () => {
    if (!isSwiping) return;

    const dx = touchCurrentX.current - touchStartX.current;
    const dt = Date.now() - touchStartTime.current;
    const velocity = Math.abs(dx) / dt;

    const currentIndex = routes.indexOf(pathname);

    let targetRoute = null;

    if (velocity > VELOCITY_THRESHOLD) {
      if (dx < 0) targetRoute = routes[currentIndex + 1];
      else targetRoute = routes[currentIndex - 1];
    } else if (Math.abs(dx) > THRESHOLD) {
      if (dx < 0) targetRoute = routes[currentIndex + 1];
      else targetRoute = routes[currentIndex - 1];
    }

    if (targetRoute) {
      const exitX =
        dx < 0 ? -window.innerWidth : window.innerWidth;

      setSwipeX(exitX);

      setTimeout(() => {
        // 🔥 CRITICAL FIX
        setSwipeX(0);
        setIsSwiping(false);
        router.push(targetRoute);
      }, 180);
    } else {
      setSwipeX(0);
      setIsSwiping(false);
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
                style={{
                  transform: `translateX(${swipeX}px)`,
                  transition: isSwiping
                    ? "none"
                    : "transform 0.25s ease",
                }}
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

          {!isSharePage && <BottomNav />}

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