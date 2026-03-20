"use client";

import { usePathname } from "next/navigation";
import useSwipeNav from "@/lib/useSwipeNav";

export default function SwipeWrapper({ children }) {
  const pathname = usePathname();
  const swipeHandlers = useSwipeNav(pathname);

  return (
    <div {...swipeHandlers} className="h-full">
      {children}
    </div>
  );
}