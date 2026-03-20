import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import AuthProvider from "@/components/auth/AuthProvider";
import MobileHeader from "@/components/layout/MobileHeader";
import BottomNav from "@/components/layout/BottomNav";
import ViewportFix from "@/components/layout/ViewportFix";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* ✅ Viewport fix */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"
        />
      </head>

      <body>
        <AuthProvider>

          {/* ✅ Fix mobile viewport height */}
          <ViewportFix />

          <div
            className="flex w-full overflow-x-hidden"
            style={{ minHeight: "calc(var(--vh, 1vh) * 100)" }}
          >
            {/* Sidebar */}
            <Sidebar />

            {/* Main */}
            <div className="flex flex-col flex-1 min-w-0">

              {/* ✅ Fixed Header */}
              <MobileHeader />

              {/* ✅ Content with proper spacing */}
              <main
                className="
                  flex-1 overflow-y-auto bg-gray-100
                  p-4 md:p-6
                  pt-20 md:pt-6
                  pb-24 md:pb-6
                  min-w-0
                "
              >
                {children}
              </main>

            </div>
          </div>

          {/* Bottom Nav */}
          <BottomNav />

        </AuthProvider>
      </body>
    </html>
  );
}