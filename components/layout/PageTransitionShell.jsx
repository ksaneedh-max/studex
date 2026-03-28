"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { TAB_ROUTES, getRouteIndex } from "@/lib/navRoutes";

export default function PageTransitionShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  const prevPath = useRef(pathname);

  // =========================
  // 🔥 PREFETCH (ZERO LAG)
  // =========================
  useEffect(() => {
    const index = getRouteIndex(pathname);

    const next = TAB_ROUTES[index + 1];
    const prev = TAB_ROUTES[index - 1];

    if (next) router.prefetch(next);
    if (prev) router.prefetch(prev);
  }, [pathname, router]);

  useEffect(() => {
    prevPath.current = pathname;
  }, [pathname]);

  // =========================
  // 🔥 DIRECTION DETECTION
  // =========================
  const getDirection = () => {
    const from = getRouteIndex(prevPath.current);
    const to = getRouteIndex(pathname);

    if (to > from) return 1;
    if (to < from) return -1;
    return 0;
  };

  const direction = getDirection();

  return (
    <div className="relative w-full h-full overflow-hidden">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={pathname}
          custom={direction}
          initial={{ x: direction > 0 ? "100%" : "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: direction > 0 ? "-100%" : "100%" }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={(e, info) => {
            const { offset, velocity } = info;

            const index = getRouteIndex(pathname);

            // 👉 iOS-style swipe detection
            if (offset.x < -100 || velocity.x < -500) {
              const next = TAB_ROUTES[index + 1];
              if (next) router.push(next);
            }

            if (offset.x > 100 || velocity.x > 500) {
              const prev = TAB_ROUTES[index - 1];
              if (prev) router.push(prev);
            }
          }}
          className="absolute inset-0 w-full h-full bg-gray-100 overflow-y-auto"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}