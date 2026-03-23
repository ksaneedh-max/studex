"use client";

import { usePathname } from "next/navigation";
import useSwipeNav from "@/lib/useSwipeNav";

export default function SwipeWrapper({ children }) {
  const pathname = usePathname();

  // ✅ Disable global swipe on timetable (has its own swipe)
  const isTimetable = pathname.startsWith("/timetable");

  // ✅ Only initialize hook when needed
  const swipeHandlers = !isTimetable
    ? useSwipeNav(pathname)
    : {};

  return (
    <div
      {...swipeHandlers}
      className="h-full"
    >
      {children}
    </div>
  );
}