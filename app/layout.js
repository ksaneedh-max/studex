"use client";

import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import AuthProvider from "@/components/auth/AuthProvider";
import MobileHeader from "@/components/layout/MobileHeader";
import BottomNav from "@/components/layout/BottomNav";
import ViewportFix from "@/components/layout/ViewportFix";
import { usePathname } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { useEffect } from "react";

export default function RootLayout({ children }) {
  const pathname = usePathname();

  const isLoginPage = pathname === "/";
  const isSharePage = pathname === "/share";

  const {
    showLeaveModal,
    handleDiscardGlobal,
    handleStayGlobal,
  } = useAppStore();

  // ✅ THIS IS THE FINAL FIX (body scroll lock)
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