"use client";

import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import AuthProvider from "@/components/auth/AuthProvider";
import MobileHeader from "@/components/layout/MobileHeader";
import BottomNav from "@/components/layout/BottomNav";
import ViewportFix from "@/components/layout/ViewportFix";
import { usePathname } from "next/navigation";

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/";

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
            {/* ✅ Sidebar ALWAYS visible */}
            <Sidebar />

            <div className="flex flex-col flex-1 min-w-0">

              {/* ✅ Header ALWAYS visible */}
              <MobileHeader />

              {/* ✅ MAIN FIX */}
              <main
                className={`
                  flex-1 bg-gray-100
                  p-4 md:p-6
                  min-w-0
                  ${isLoginPage ? "overflow-hidden pt-6 pb-6" : "overflow-y-auto pt-20 md:pt-6 pb-24 md:pb-6"}
                `}
              >
                {children}
              </main>

            </div>
          </div>

          {/* ✅ BottomNav ALWAYS visible */}
          <BottomNav />

        </AuthProvider>
      </body>
    </html>
  );
}