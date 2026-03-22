"use client";

import { usePathname } from "next/navigation";

export default function MobileHeader() {
  const pathname = usePathname();
  const isLoginPage = pathname === "/";

  return (
    <div
      className="
        md:hidden
        fixed top-0 left-0 right-0
        z-50
        flex items-center gap-3
        p-4
        bg-white/90 backdrop-blur
        border-b
      "
    >
      {/* Hamburger (hidden on login) */}
      {!isLoginPage && (
        <button
          onClick={() =>
            document.dispatchEvent(new Event("toggle-sidebar"))
          }
          className="p-2 rounded bg-gray-100"
        >
          ☰
        </button>
      )}

      {/* Title */}
      <h1 className="font-bold tracking-tight text-lg">
        Academia DeX
      </h1>
    </div>
  );
}