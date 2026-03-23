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

  // 🔥 IMPORTANT: use safe navigation
  const { safePush } = useTimetableLogic();

  const items = [
    {
      name: "Attendance",
      href: "/attendance",
      icon: ClipboardCheck,
    },
    {
      name: "Marks",
      href: "/marks",
      icon: BarChart3,
    },
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Home,
      center: true,
    },
    {
      name: "Timetable",
      href: "/timetable",
      icon: CalendarDays,
    },
    {
      name: "Planner",
      href: "/planner",
      icon: Calendar,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="bg-white border-t shadow-sm">
        <div className="relative grid grid-cols-5 items-center">
          {items.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;

            // 🌟 CENTER BUTTON
            if (item.center) {
              return (
                <button
                  key={item.href}
                  onClick={() => safePush(item.href)}
                  className="flex justify-center"
                >
                  <div
                    className={`
                      tap
                      -mt-6 flex flex-col items-center justify-center
                      w-14 h-14 rounded-full shadow-md transition
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
                onClick={() => safePush(item.href)}
                className="tap flex flex-col items-center justify-center py-2 text-xs relative"
              >
                <Icon
                  size={18}
                  className={`transition ${
                    active ? "text-black" : "text-gray-400"
                  }`}
                />

                <span
                  className={`text-[10px] mt-1 ${
                    active
                      ? "text-black font-medium"
                      : "text-gray-400"
                  }`}
                >
                  {item.name}
                </span>

                {/* Active dot */}
                {active && !item.center && (
                  <span className="absolute bottom-1 w-1 h-1 bg-black rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}