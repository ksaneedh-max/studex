"use client";

import { useRouter } from "next/navigation";

export default function MobileHeader() {
  const router = useRouter();

  return (
    <div
      className="
        md:hidden
        fixed top-0 left-0 right-0
        z-50
        flex items-center gap-3
        px-4 py-4
        bg-white
        shadow-[0_2px_12px_rgba(0,0,0,0.05)]
      "
    >
      {/* Hamburger */}
      <button
        onClick={() =>
          document.dispatchEvent(new Event("toggle-sidebar"))
        }
        className="
          flex items-center justify-center
          w-10 h-10
          rounded-xl
          bg-gray-100
          active:scale-95 transition
        "
      >
        <span className="text-lg leading-none">☰</span>
      </button>

      {/* Premium Logo */}
      <div
        onClick={() => router.push("/dashboard")}
        className="
          flex items-center cursor-pointer
          active:scale-95 transition
        "
      >
        <h1 className="flex items-center text-xl leading-none tracking-tight">
          
          {/* Logo A */}
          <span
            className="
              w-8 h-8
              flex items-center justify-center
              rounded-lg
              bg-gradient-to-br from-black to-gray-800
              text-white text-sm font-semibold
              shadow-sm
            "
          >
            A
          </span>

          {/* Text */}
          <span className="font-medium ml-[1px]">
            cademia
          </span>

          <span className="font-bold ml-[2px]">
            DeX
          </span>
        </h1>
      </div>
    </div>
  );
}