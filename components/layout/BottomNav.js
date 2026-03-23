"use client";

import { usePathname } from "next/navigation";
import {
  Home,
  ClipboardCheck,
  BarChart3,
  CalendarDays,
  Calendar,
} from "lucide-react";

import { useTimetableLogic } from "@/app/hooks/useTimetable";

export default function BottomNav() {
  const pathname = usePathname();
  const { safePush } = useTimetableLogic();

  // 🔥 haptic feedback
  const triggerHaptic = () => {
    if (typeof window !== "undefined" && navigator.vibrate) {
      navigator.vibrate(8);
    }
  };

  const handleNav = (href) => {
    triggerHaptic();
    safePush(href);
  };

  const items = [
    { name: "Attendance", href: "/attendance", icon: ClipboardCheck },
    { name: "Marks", href: "/marks", icon: BarChart3 },
    { name: "Dashboard", href: "/dashboard", icon: Home, center: true },
    { name: "Timetable", href: "/timetable", icon: CalendarDays },
    { name: "Planner", href: "/planner", icon: Calendar },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="bg-white/90 backdrop-blur border-t shadow-sm">
        <div className="relative grid grid-cols-5 items-center">

          {items.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;

            // 🌟 CENTER BUTTON (FAB style)
            if (item.center) {
              return (
                <button
                  key={item.href}
                  onClick={() => handleNav(item.href)}
                  className="flex justify-center"
                >
                  <div
                    className={`
                      -mt-6 flex items-center justify-center
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
                className="flex flex-col items-center justify-center py-2 text-xs relative transition-all duration-200 active:scale-95"
              >
                {/* 🔥 Active pill background */}
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
    </div>
  );
}