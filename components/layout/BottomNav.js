"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useRef, useEffect } from "react";
import {
  Home,
  ClipboardCheck,
  BarChart3,
  CalendarDays,
  Calendar,
} from "lucide-react";

import { useTimetableLogic } from "@/app/hooks/useTimetable";

// 🔥 KEEP IN SYNC WITH SWIPE (layout.js)
const TAB_ROUTES = [
  "/attendance",
  "/marks",
  "/dashboard",
  "/timetable",
  "/planner",
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { safePush } = useTimetableLogic();

  const lastClickRef = useRef(0);

  // =========================
  // 🚀 SAFE PREFETCH (NO LOOPS)
  // =========================
  useEffect(() => {
    const index = TAB_ROUTES.findIndex((r) =>
      pathname.startsWith(r)
    );

    if (index === -1) return;

    const next = TAB_ROUTES[index + 1];
    const prev = TAB_ROUTES[index - 1];

    // ✅ Correct prefetch (no navigation side effects)
    if (next) router.prefetch(next);
    if (prev) router.prefetch(prev);

  }, [pathname, router]);

  // =========================
  // 🔥 SAFE NAV HANDLER
  // =========================
  const handleNav = useCallback(
    (href) => {
      const now = Date.now();

      // 🚫 prevent double taps
      if (now - lastClickRef.current < 300) return;
      lastClickRef.current = now;

      // 🚫 prevent same route (including nested)
      if (pathname.startsWith(href)) return;

      // 🔥 haptic feedback
      if (typeof window !== "undefined" && navigator.vibrate) {
        navigator.vibrate(8);
      }

      safePush(href);
    },
    [pathname, safePush]
  );

  const items = [
    { name: "Attendance", href: "/attendance", icon: ClipboardCheck },
    { name: "Marks", href: "/marks", icon: BarChart3 },
    { name: "Dashboard", href: "/dashboard", icon: Home, center: true },
    { name: "Timetable", href: "/timetable", icon: CalendarDays },
    { name: "Planner", href: "/planner", icon: Calendar },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="bg-white/90 backdrop-blur border-t shadow-sm">
        <div className="relative grid grid-cols-5 items-center">

          {items.map((item) => {
            const active = pathname.startsWith(item.href);
            const Icon = item.icon;

            // 🌟 CENTER BUTTON
            if (item.center) {
              return (
                <button
                  key={item.href}
                  onClick={() => handleNav(item.href)}
                  aria-label={item.name}
                  className="flex justify-center"
                >
                  <div
                    className={`
                      -mt-5 flex items-center justify-center
                      w-14 h-14 rounded-full shadow-lg transition-all duration-200
                      active:scale-95
                      ${
                        active
                          ? "bg-black text-white scale-105"
                          : "bg-white text-gray-700 border"
                      }
                    `}
                  >
                    <Icon size={20} />
                  </div>
                </button>
              );
            }

            // 📱 NORMAL ITEMS
            return (
              <button
                key={item.href}
                onClick={() => handleNav(item.href)}
                aria-label={item.name}
                className="flex flex-col items-center justify-center py-2 text-xs relative transition-all duration-200 active:scale-95"
              >
                {/* Active background */}
                <div
                  className={`
                    absolute inset-1 rounded-lg transition-all duration-200
                    ${active ? "bg-gray-100" : ""}
                  `}
                />

                <Icon
                  size={18}
                  className={`
                    relative z-10 transition-all duration-200
                    ${active ? "text-black scale-110" : "text-gray-400"}
                  `}
                />

                <span
                  className={`
                    relative z-10 text-[10px] mt-1 transition-all
                    ${
                      active
                        ? "text-black font-medium"
                        : "text-gray-400"
                    }
                  `}
                >
                  {item.name}
                </span>
              </button>
            );
          })}

        </div>
      </div>
    </nav>
  );
}