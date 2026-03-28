"use client";

import { useEffect } from "react";

export default function ViewportFix() {
  useEffect(() => {
    const setVH = () => {
      const height =
        window.visualViewport?.height || window.innerHeight;

      const vh = height * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };

    setVH();

    // 🔥 use visualViewport if available
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", setVH);
      window.visualViewport.addEventListener("scroll", setVH);
    } else {
      window.addEventListener("resize", setVH);
      window.addEventListener("orientationchange", setVH);
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", setVH);
        window.visualViewport.removeEventListener("scroll", setVH);
      } else {
        window.removeEventListener("resize", setVH);
        window.removeEventListener("orientationchange", setVH);
      }
    };
  }, []);

  return null;
}