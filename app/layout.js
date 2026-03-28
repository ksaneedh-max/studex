"use client";

import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import AuthProvider from "@/components/auth/AuthProvider";
import MobileHeader from "@/components/layout/MobileHeader";
import BottomNav from "@/components/layout/BottomNav";
import ViewportFix from "@/components/layout/ViewportFix";
import PageTransitionShell from "@/components/layout/PageTransitionShell";

import { usePathname, useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { useEffect } from "react";
import { TAB_ROUTES, getRouteIndex } from "@/lib/navRoutes";

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
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSharePage]);

  // =========================
  // ⚡ PREFETCH (ZERO LAG)
  // =========================
  useEffect(() => {
    const index = getRouteIndex(pathname);
    if (index === -1) return;

    const next = TAB_ROUTES[index + 1];
    const prev = TAB_ROUTES[index - 1];

    if (next) router.prefetch(next);
    if (prev) router.prefetch(prev);
  }, [pathname, router]);

  const mainClassName = `
    flex-1 bg-gray-100 min-w-0 overflow-hidden
    ${
      isLoginPage
        ? "pt-6 pb-6"
        : isSharePage
        ? "p-0"
        : "pt-20 md:pt-6 pb-24 md:pb-6 p-4 md:p-6"
    }
  `;

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

              {/* ✅ ONLY THIS handles swipe + animation */}
              <main className={mainClassName}>
                <PageTransitionShell>
                  {children}
                </PageTransitionShell>
              </main>
            </div>
          </div>

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