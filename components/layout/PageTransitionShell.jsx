"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { getSwipeDirection } from "@/lib/navRoutes";

const pageVariants = {
  enter: (direction) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 1,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction) => ({
    x: direction > 0 ? "-100%" : "100%",
    opacity: 1,
  }),
};

export default function PageTransitionShell({ children }) {
  const pathname = usePathname();
  const previousPathRef = useRef(pathname);

  const direction = getSwipeDirection(previousPathRef.current, pathname);

  useEffect(() => {
    previousPathRef.current = pathname;
  }, [pathname]);

  return (
    <div className="relative h-full w-full min-h-0 overflow-hidden">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={pathname}
          custom={direction}
          variants={pageVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            type: "tween",
            duration: 0.28,
            ease: "easeInOut",
          }}
          className="absolute inset-0 h-full w-full overflow-y-auto overscroll-contain will-change-transform"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}