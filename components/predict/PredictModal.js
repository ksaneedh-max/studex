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
  // 📅 AUTO MONTH
  // =========================
  useEffect(() => {
    const index = months.findIndex((m) =>
      yearData[m].some((d) => d.date >= today)
    );
    if (index !== -1) setMonthIndex(index);
  }, []);

  const toggleDate = (date, dayOrder) => {
    if (!dayOrder || date < today) return;

    setSelectedDates((prev) =>
      prev.includes(date)
        ? prev.filter((d) => d !== date)
        : [...prev, date]
    );
  };

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
  // 📊 DISPLAY CALC
  // =========================
  const getDisplayData = (pred) => {
    const total = pred.total;
    const absent = pred.absent;
    const present = total - absent;
    const percentage = pred.percentage;

    const MIN = 75;

    const required =
      total > 0
        ? Math.max(
            0,
            Math.ceil((MIN * total - 100 * present) / (100 - MIN))
          )
        : 0;

    const margin = Math.max(
      0,
      Math.floor((present - (MIN / 100) * total) / (MIN / 100))
    );

    const original = attendance.find((a) => a.id === pred.id);
    const oldPercent = original?.percentage || 0;
    const diff = Number((percentage - oldPercent).toFixed(2));

    return {
      title: pred.course_title || pred.code,
      percentage,
      required,
      margin,
      diff,
    };
  };

  const firstDayIndex = monthData.length
    ? new Date(monthData[0].date).getDay()
    : 0;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-2">

      {/* MODAL */}
      <div className="bg-white w-full max-w-md rounded-xl max-h-[90vh] flex flex-col">

        {/* HEADER */}
        <div className="p-4 border-b flex justify-between items-center">
          <button
            onClick={() => setMonthIndex((p) => Math.max(0, p - 1))}
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

        {/* BODY */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">

          {/* CALENDAR */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs">
            {["S","M","T","W","T","F","S"].map((d, i) => (
              <div key={i} className="font-semibold text-gray-500">
                {d}
              </div>
            ))}

            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={i} />
            ))}

            {monthData.map((d) => {
              const isPast = d.date < today;
              const isSelected = selectedDates.includes(d.date);
              const isHoliday = !d.dayOrder;

              return (
                <button
                  key={d.date}
                  disabled={isHoliday || isPast}
                  onClick={() => toggleDate(d.date, d.dayOrder)}
                  className={`p-1 rounded-lg flex flex-col items-center
                    ${isSelected ? "bg-black text-white" : ""}
                    ${!isSelected && !isHoliday && !isPast ? "bg-gray-100" : ""}
                    ${isHoliday || isPast ? "opacity-30" : ""}
                  `}
                >
                  <div>{d.date.split("-")[2]}</div>
                  <div className="text-[10px]">
                    {d.dayOrder ? `D${d.dayOrder}` : d.holiday ? "H" : "-"}
                  </div>
                </button>
              );
            })}
          </div>

          {/* RESULT */}
          <div className="bg-gray-50 p-3 rounded-xl max-h-64 overflow-auto">
            <h3 className="font-semibold mb-3">Prediction</h3>

            {result.length === 0 && (
              <p className="text-sm text-gray-500">Select dates</p>
            )}

            <div className="space-y-2">
              {result.map((r) => {
                const d = getDisplayData(r);
                const isDanger = d.percentage < 75;

                return (
                  <div
                    key={r.id}
                    className="bg-white rounded-xl p-3 shadow-sm border flex justify-between"
                  >
                    <div>
                      <div className="font-medium text-sm flex items-center gap-2">
                        {d.title}
                        {r.type === "Practical" && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">
                            LAB
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {d.percentage}%
                      </div>
                    </div>

                    <div className="text-right">
                      {isDanger ? (
                        <div className="text-red-600 font-semibold text-sm">
                          Req: {d.required}
                        </div>
                      ) : (
                        <div className="text-green-600 font-semibold text-sm">
                          Mar: {d.margin}
                        </div>
                      )}

                      <div
                        className={`text-xs ${
                          d.diff < 0 ? "text-red-500" : "text-green-500"
                        }`}
                      >
                        {d.diff < 0 ? "↓" : "↑"} {Math.abs(d.diff)}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* FOOTER (SAFE AREA FIX) */}
        <div className="p-4 border-t flex gap-2 pb-6">
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