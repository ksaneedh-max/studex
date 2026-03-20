"use client";

import { useState, useEffect } from "react";
import plannerData from "@/data/planner.json";
import timetableData from "@/data/timetable.json";

import { getTodayStr } from "@/lib/timetable";
import { getOverrides } from "@/lib/storage";
import { predictAttendance } from "@/lib/predict";

export default function PredictModal({ onClose, data, onApply }) {
  const [selectedDates, setSelectedDates] = useState([]);
  const [monthIndex, setMonthIndex] = useState(0);

  const today = getTodayStr();
  const yearData = plannerData["2026"];

  const months = Object.keys(yearData);
  const currentMonthName = months[monthIndex];
  const monthData = yearData[currentMonthName] || [];

  const subjects = data.subjects || [];
  const attendance = data.attendance || [];
  const batch = data.batch || "1";

  const timetable =
    batch === "1" ? timetableData.batch1 : timetableData.batch2;

  const overrides = getOverrides();

  // =========================
  // 📅 AUTO JUMP TO CURRENT MONTH
  // =========================
  useEffect(() => {
    const index = months.findIndex((m) =>
      yearData[m].some((d) => d.date >= today)
    );
    if (index !== -1) setMonthIndex(index);
  }, []);

  // =========================
  // 📌 SELECT DATE
  // =========================
  const toggleDate = (date, dayOrder) => {
    if (!dayOrder || date < today) return;

    setSelectedDates((prev) =>
      prev.includes(date)
        ? prev.filter((d) => d !== date)
        : [...prev, date]
    );
  };

  // =========================
  // 📊 PREDICTION
  // =========================
  const result =
    selectedDates.length > 0
      ? predictAttendance({
          selectedDates,
          plannerData: yearData,
          timetable,
          subjects,
          overrides,
          attendance,
        })
      : [];

  // =========================
  // 🔥 CALENDAR ALIGNMENT FIX
  // =========================
  const firstDayIndex = monthData.length
    ? new Date(monthData[0].date).getDay()
    : 0;

  // =========================
  // 🚀 UI
  // =========================
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-xl w-full max-w-md">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() =>
              setMonthIndex((p) => Math.max(0, p - 1))
            }
            className="px-2 py-1 border rounded"
          >
            ←
          </button>

          <h2 className="font-bold">{currentMonthName}</h2>

          <button
            onClick={() =>
              setMonthIndex((p) =>
                Math.min(months.length - 1, p + 1)
              )
            }
            className="px-2 py-1 border rounded"
          >
            →
          </button>
        </div>

        {/* CALENDAR */}
        <div className="grid grid-cols-7 gap-2 text-center text-xs">

          {/* WEEK HEADERS */}
          {["S","M","T","W","T","F","S"].map((d, i) => (
            <div key={`day-${i}`} className="font-semibold text-gray-500">
              {d}
            </div>
          ))}

          {/* EMPTY CELLS (ALIGNMENT FIX) */}
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {/* DATES */}
          {monthData.map((d) => {
            const isPast = d.date < today;
            const isSelected = selectedDates.includes(d.date);
            const isHoliday = !d.dayOrder;

            return (
              <button
                key={d.date}
                disabled={isHoliday || isPast}
                onClick={() => toggleDate(d.date, d.dayOrder)}
                className={`p-1 rounded-lg flex flex-col items-center justify-center
                  
                  ${isSelected ? "bg-black text-white" : ""}
                  ${!isSelected && !isHoliday && !isPast ? "bg-gray-100 hover:bg-gray-200" : ""}
                  ${isHoliday || isPast ? "opacity-30 cursor-not-allowed" : ""}
                `}
              >
                {/* DATE */}
                <div>{d.date.split("-")[2]}</div>

                {/* DAY ORDER / HOLIDAY */}
                <div className="text-[10px]">
                  {d.dayOrder
                    ? `D${d.dayOrder}`
                    : d.holiday
                    ? "H"
                    : "-"}
                </div>
              </button>
            );
          })}
        </div>

        {/* RESULT */}
        <div className="mt-4 max-h-40 overflow-auto">
          <h3 className="font-semibold mb-2">Prediction</h3>

          {result.length === 0 && (
            <p className="text-sm text-gray-500">
              Select dates
            </p>
          )}

          {result.map((r) => (
            <div key={r.id} className="text-sm">
              {r.code} → {r.percentage}%
            </div>
          ))}
        </div>

        {/* ACTIONS */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => {
              onApply(result);
              onClose();
            }}
            className="flex-1 bg-black text-white py-2 rounded-lg"
          >
            Done
          </button>

          <button
            onClick={onClose}
            className="flex-1 border py-2 rounded-lg"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}