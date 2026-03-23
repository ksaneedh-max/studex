"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import plannerData from "@/data/planner.json";
import timetableData from "@/data/timetable.json";

import { getTodayStr } from "@/lib/timetable";
import { predictAttendance } from "@/lib/predict";

export default function PredictModal({ onClose, data, onApply, overrides }) {
  const router = useRouter();

  const [selectedDates, setSelectedDates] = useState([]);
  const [monthIndex, setMonthIndex] = useState(0);
  const [navHeight, setNavHeight] = useState(0);

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

  // =========================
  // 📐 NAV HEIGHT FIX
  // =========================
  useEffect(() => {
    const measure = () => {
      const nav = document.querySelector("div.fixed.bottom-0");
      if (nav) {
        const rect = nav.getBoundingClientRect();
        const visibleHeight = window.innerHeight - rect.top;
        setNavHeight(visibleHeight);
      }
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // =========================
  // 📅 AUTO MONTH SELECT
  // =========================
  useEffect(() => {
    const index = months.findIndex((m) =>
      yearData[m].some((d) => d.date >= today)
    );
    if (index !== -1) setMonthIndex(index);
  }, []);

  // =========================
  // 📅 DATE SELECT
  // =========================
  const toggleDate = (date) => {
    if (date < today) return;

    setSelectedDates((prev) =>
      prev.includes(date)
        ? prev.filter((d) => d !== date)
        : [...prev, date]
    );
  };

  // =========================
  // 🔥 PREDICTION (FIXED)
  // =========================
  const result =
    selectedDates.length > 0
      ? predictAttendance({
          selectedDates,
          plannerData: yearData,
          timetable,
          subjects,
          overrides, // ✅ NOW COMES FROM PROPS (correct)
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

  const GAP = 12;

  return (
    <div
      className="fixed inset-0 bg-black/40 flex justify-center items-start z-50 px-3 pt-6"
      style={{
        paddingBottom: navHeight + GAP,
      }}
    >
      <div className="w-full max-w-sm space-y-2 flex flex-col">

        {/* Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 flex items-start justify-between gap-2 text-xs">
          <div>
            <p className="font-medium text-blue-800">
              ⚙️ Using your timetable
            </p>
            <p className="text-blue-700 text-[11px]">
              Update it if your schedule has changed
            </p>
          </div>

          <button
            onClick={() => router.push("/timetable")}
            className="shrink-0 bg-blue-600 text-white px-2 py-1 rounded text-[11px]"
          >
            Edit
          </button>
        </div>

        {/* Modal */}
        <div className="bg-white w-full rounded-xl flex flex-col shadow-lg overflow-hidden max-h-[70vh]">

          {/* Header */}
          <div className="px-3 py-2 border-b flex justify-between items-center text-sm">
            <button
              onClick={() => setMonthIndex((p) => Math.max(0, p - 1))}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100"
            >
              ←
            </button>

            <h2 className="font-semibold">{currentMonthName}</h2>

            <button
              onClick={() =>
                setMonthIndex((p) => Math.min(months.length - 1, p + 1))
              }
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100"
            >
              →
            </button>
          </div>

          {/* Body */}
          <div className="overflow-y-auto px-3 py-2 space-y-2">

            {/* Calendar */}
            <div className="grid grid-cols-7 gap-1 text-center text-[11px]">
              {["S","M","T","W","T","F","S"].map((d, i) => (
                <div key={i} className="font-medium text-gray-500">{d}</div>
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
                    disabled={isPast}
                    onClick={() => toggleDate(d.date)}
                    className={`p-1 rounded-md flex flex-col items-center transition-all
                      ${isSelected ? "bg-black text-white scale-105 ring-2 ring-gray-400" : ""}
                      ${!isSelected && !isPast ? "bg-gray-100 hover:bg-gray-200" : ""}
                      ${isPast ? "opacity-30" : ""}
                      ${!isSelected && isHoliday && !isPast ? "bg-yellow-100" : ""}
                    `}
                  >
                    <div>{d.date.split("-")[2]}</div>
                    <div className="text-[9px]">
                      {d.dayOrder ? `D${d.dayOrder}` : d.holiday ? "H" : "-"}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Prediction */}
            <div className="bg-gray-50 p-2 rounded-lg mt-1">
              <h3 className="font-medium text-sm mb-2">Prediction</h3>

              {result.length === 0 && (
                <p className="text-xs text-gray-500">Select dates</p>
              )}

              <div className="space-y-2">
                {result.map((r) => {
                  const d = getDisplayData(r);
                  const isDanger = d.percentage < 75;

                  return (
                    <div
                      key={r.id}
                      className="bg-white rounded-lg p-2 border flex justify-between text-xs"
                    >
                      <div>
                        <div className="font-medium">{d.title}</div>
                        <div className="text-gray-500">{d.percentage}%</div>
                      </div>

                      <div className="text-right">
                        {isDanger ? (
                          <div className="text-red-600">Req: {d.required}</div>
                        ) : (
                          <div className="text-green-600">Mar: {d.margin}</div>
                        )}

                        <div className={`${d.diff < 0 ? "text-red-500" : "text-green-500"}`}>
                          {d.diff < 0 ? "↓" : "↑"} {Math.abs(d.diff)}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="p-2 border-t flex gap-2 bg-white">
            <button
              onClick={() => { onApply(result); onClose(); }}
              className="flex-1 bg-black text-white py-2 rounded-md text-sm"
            >
              Done
            </button>

            <button
              onClick={onClose}
              className="flex-1 border py-2 rounded-md text-sm"
            >
              Cancel
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}