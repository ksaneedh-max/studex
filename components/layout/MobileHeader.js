"use client";

export default function MobileHeader() {
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
      {/* Hamburger */}
      <button
        onClick={() =>
          document.dispatchEvent(new Event("toggle-sidebar"))
        }
        className="p-2 rounded bg-gray-100"
      >
        ☰
      </button>

      {/* Title */}
      <h1 className="font-semibold text-lg">
        Student Portal
      </h1>
    </div>
  );
}