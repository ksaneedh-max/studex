"use client";

import { useState, useEffect, useRef } from "react";
import plannerData from "@/data/planner.json";

import Card from "@/components/ui/Card";
import SectionTitle from "@/components/ui/SectionTitle";

export default function Planner() {

  const yearData = plannerData["2026"] || {};
  const months = Object.keys(yearData);

  const today = new Date();

  const currentMonthName = today.toLocaleString("default", {
    month: "long",
  });

  const initialMonth = months.includes(currentMonthName)
    ? currentMonthName
    : months[0];

  const [selectedMonth, setSelectedMonth] = useState(initialMonth);

  const days = yearData[selectedMonth] || [];

  const todayStr = today.toISOString().split("T")[0];

  const todayRef = useRef(null);

  useEffect(() => {
    if (todayRef.current) {
      todayRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [selectedMonth]);

  return (
    <div
      className="p-4 md:p-6 bg-gray-100 min-h-screen overflow-x-hidden"
    >

      {/* Header */}
      <h1 className="text-lg md:text-2xl font-bold mb-4 break-words">
        Academic Planner 2026
      </h1>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 text-xs mb-4">
        <span className="px-2 py-1 rounded-full bg-red-100 text-red-600">
          Holiday
        </span>
        <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-600">
          Event
        </span>
        <span className="px-2 py-1 rounded-full bg-green-100 text-green-600">
          Day Order
        </span>
        <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
          Today
        </span>
      </div>

      {/* Month Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5">

        {months.map((month) => (
          <button
            key={month}
            onClick={() => setSelectedMonth(month)}
            className={`
              px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition flex-shrink-0
              ${
                selectedMonth === month
                  ? "bg-black text-white"
                  : "bg-white border text-gray-600"
              }
            `}
          >
            {month}
          </button>
        ))}

      </div>

      {/* Calendar */}
      <div className="max-w-full overflow-hidden">
        <Card>
          <SectionTitle>{selectedMonth}</SectionTitle>

          {days.length === 0 ? (
            <p className="text-gray-500">No data available</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 w-full">

              {days.map((d) => {
                const isHoliday = !!d.holiday;
                const isEvent = !!d.event;

                const dateObj = new Date(d.date);
                const dayNumber = dateObj.getDate();

                const isToday = d.date === todayStr;

                let bg = "bg-white";

                if (isHoliday) bg = "bg-red-100";
                else if (isEvent) bg = "bg-blue-100";
                else if (d.dayOrder) bg = "bg-green-50";

                return (
                  <div
                    key={d.date}
                    ref={isToday ? todayRef : null}
                    className={`
                      p-3 rounded-xl border text-sm transition
                      ${bg}
                      ${
                        isToday
                          ? "ring-2 ring-black bg-yellow-100 shadow-md"
                          : ""
                      }
                    `}
                  >

                    {/* Top Row */}
                    <div className="flex justify-between items-center">

                      <span className="font-semibold text-base">
                        {dayNumber}
                      </span>

                      <span className="text-[10px] text-gray-500">
                        {d.day}
                      </span>

                    </div>

                    {/* Day Order */}
                    {d.dayOrder && (
                      <div className="mt-1 text-green-700 font-medium text-xs">
                        Day {d.dayOrder}
                      </div>
                    )}

                    {/* Holiday */}
                    {d.holiday && (
                      <div className="mt-1 text-red-600 text-xs line-clamp-2">
                        {d.holiday}
                      </div>
                    )}

                    {/* Event */}
                    {d.event && (
                      <div className="mt-1 text-blue-600 text-xs line-clamp-2">
                        {d.event}
                      </div>
                    )}

                    {/* Today Badge */}
                    {isToday && (
                      <div className="mt-2 inline-block text-[10px] font-bold bg-black text-white px-2 py-0.5 rounded">
                        TODAY
                      </div>
                    )}

                  </div>
                );
              })}

            </div>
          )}
        </Card>
      </div>

    </div>
  );
}