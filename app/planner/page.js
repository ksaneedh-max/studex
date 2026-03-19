"use client";

import { useState } from "react";
import plannerData from "@/data/planner.json";

// UI
import Card from "@/components/ui/Card";
import SectionTitle from "@/components/ui/SectionTitle";

export default function Planner() {
  const yearData = plannerData["2026"];

  const months = Object.keys(yearData);

  const [selectedMonth, setSelectedMonth] = useState(months[0]);

  const days = yearData[selectedMonth] || [];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">

      {/* Header */}
      <h1 className="text-2xl font-bold mb-4">
        Academic Planner 2026
      </h1>

      {/* Month Selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {months.map((month) => (
          <button
            key={month}
            onClick={() => setSelectedMonth(month)}
            className={`px-3 py-1 rounded border ${
              selectedMonth === month
                ? "bg-blue-500 text-white"
                : "bg-white"
            }`}
          >
            {month}
          </button>
        ))}
      </div>

      {/* Month View */}
      <Card>
        <SectionTitle>{selectedMonth}</SectionTitle>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">

          {days.map((d, i) => {
            const isHoliday = !!d.holiday;
            const isEvent = !!d.event;

            let bg = "bg-white";

            if (isHoliday) bg = "bg-red-100";
            else if (isEvent) bg = "bg-blue-100";
            else if (d.dayOrder) bg = "bg-green-50";

            return (
              <div
                key={i}
                className={`p-3 rounded border text-sm ${bg}`}
              >
                {/* Date */}
                <div className="font-semibold">
                  {d.date.split("-")[2]}
                </div>

                {/* Day */}
                <div className="text-xs text-gray-500">
                  {d.day}
                </div>

                {/* Day Order */}
                {d.dayOrder && (
                  <div className="mt-1 text-green-700 font-medium">
                    Day {d.dayOrder}
                  </div>
                )}

                {/* Holiday */}
                {d.holiday && (
                  <div className="mt-1 text-red-600 text-xs">
                    {d.holiday}
                  </div>
                )}

                {/* Event */}
                {d.event && (
                  <div className="mt-1 text-blue-600 text-xs">
                    {d.event}
                  </div>
                )}

              </div>
            );
          })}

        </div>
      </Card>

    </div>
  );
}