import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import AuthProvider from "@/components/auth/AuthProvider";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>

        <AuthProvider>

          <div className="flex">

            {/* Sidebar */}
            <Sidebar />

            {/* Content */}
            <main className="flex-1">
              {children}
            </main>

          </div>

        </AuthProvider>

      </body>
    </html>
  );
}