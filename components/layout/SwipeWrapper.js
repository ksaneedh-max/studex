"use client";

import { usePathname } from "next/navigation";
import useSwipeNav from "@/lib/useSwipeNav";

export default function SwipeWrapper({ children }) {
  const pathname = usePathname();

  const isTimetable = pathname === "/timetable";

  const swipeHandlers = isTimetable
    ? {}
    : useSwipeNav(pathname);

  return (
    <div {...swipeHandlers} className="h-full">
      {children}
    </div>
  );
}