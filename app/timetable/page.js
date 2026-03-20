"use client";

import { useEffect, useRef, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { getData } from "@/lib/storage";
import { useRouter } from "next/navigation";

import timetableData from "@/data/timetable.json";
import plannerData from "@/data/planner.json";

import Card from "@/components/ui/Card";
import SectionTitle from "@/components/ui/SectionTitle";

// 🎨 Subject Color
function getColor(code = "") {
  const colors = [
    "bg-blue-100 border-blue-300",
    "bg-green-100 border-green-300",
    "bg-purple-100 border-purple-300",
    "bg-yellow-100 border-yellow-300",
    "bg-pink-100 border-pink-300",
    "bg-indigo-100 border-indigo-300",
  ];

  let hash = 0;
  for (let i = 0; i < code.length; i++) {
    hash = code.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}

// ⏰ Period timings
const PERIOD_TIMINGS = [
  { name: "P1", start: "08:00", end: "08:50" },
  { name: "P2", start: "08:50", end: "09:40" },
  { name: "P3", start: "09:45", end: "10:35" },
  { name: "P4", start: "10:40", end: "11:30" },
  { name: "P5", start: "11:35", end: "12:25" },
  { name: "P6", start: "12:30", end: "13:20" },
  { name: "P7", start: "13:25", end: "14:15" },
  { name: "P8", start: "14:20", end: "15:10" },
  { name: "P9", start: "15:10", end: "16:00" },
  { name: "P10", start: "16:00", end: "16:50" },
  { name: "P11", start: "16:50", end: "17:40" },
  { name: "P12", start: "17:40", end: "18:30" },
];

// ⏱ Current period
function getCurrentPeriod() {
  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();

  let last = null;

  for (let p of PERIOD_TIMINGS) {
    const [sh, sm] = p.start.split(":").map(Number);
    const [eh, em] = p.end.split(":").map(Number);

    const start = sh * 60 + sm;
    const end = eh * 60 + em;

    if (minutes >= start && minutes < end) return p.name;
    if (minutes >= end) last = p.name;
  }

  return last;
}

// 📅 Date
function getTodayStr() {
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(
    t.getDate()
  ).padStart(2, "0")}`;
}

// 📅 Day Order
function getTodayDayOrder(yearData, todayStr) {
  for (const month of Object.values(yearData)) {
    for (const d of month) {
      if (d.date === todayStr) return d.dayOrder || null;
    }
  }
  return null;
}

export default function Timetable() {
  const router = useRouter();
  const { data, setData } = useAppStore();
  const todayRef = useRef(null);

  const [activeDayIndex, setActiveDayIndex] = useState(0);

  useEffect(() => {
    if (!data) {
      const saved = getData();
      if (saved) setData(saved);
      else router.push("/");
    }
  }, [data, setData, router]);

  if (!data) {
    return (
      <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
        Loading timetable...
      </div>
    );
  }

  const subjects = data?.subjects || [];
  const batch = data?.batch || "1";

  const timetable =
    batch === "1"
      ? timetableData.batch1
      : timetableData.batch2;

  const yearData = plannerData["2026"] || {};

  const todayStr = getTodayStr();
  const todayOrder = getTodayDayOrder(yearData, todayStr);
  const todayKey = todayOrder ? `Day${todayOrder}` : null;

  const currentPeriod = getCurrentPeriod();

  const days = Object.entries(timetable);

  // Auto select today
  useEffect(() => {
    if (todayKey) {
      const index = days.findIndex(([d]) => d === todayKey);
      if (index !== -1) setActiveDayIndex(index);
    }
  }, [todayKey]);

  // 🔍 Find subject
  const findSubject = (slotValue) => {
    if (!slotValue) return null;

    const possible = slotValue.split("/").map((s) => s.trim());

    if (slotValue.startsWith("P")) {
      return subjects.find((s) => s.slot === "LAB");
    }

    return subjects.find((s) =>
      possible.includes(s.slot)
    );
  };

  // 👆 Swipe
  let touchStartX = 0;

  const handleTouchStart = (e) => {
    touchStartX = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;

    if (diff > 50 && activeDayIndex < days.length - 1) {
      setActiveDayIndex((p) => p + 1);
    }

    if (diff < -50 && activeDayIndex > 0) {
      setActiveDayIndex((p) => p - 1);
    }
  };

  return (
    <div className="p-4 md:p-6 bg-gray-100 min-h-screen">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold">
          Day Order Timetable
        </h1>
        <p className="text-sm text-gray-500">
          Batch {batch}
        </p>
      </div>

      {!todayKey ? (
        <Card>
          <p className="text-gray-500">
            No classes today 🎉
          </p>
        </Card>
      ) : (
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >

          {/* 📱 MOBILE */}
          <div className="md:hidden space-y-4">

            {/* Day Buttons */}
            <div className="flex justify-center gap-2">
              {days.map(([day], idx) => {
                const isActive = idx === activeDayIndex;
                const isToday = day === todayKey;

                return (
                  <button
                    key={day}
                    onClick={() => setActiveDayIndex(idx)}
                    className={`
                      w-9 h-9 rounded-lg text-sm font-semibold
                      flex items-center justify-center transition
                      ${isActive
                        ? "bg-black text-white"
                        : "bg-white border text-gray-600"}
                      ${isToday ? "ring-2 ring-yellow-400" : ""}
                    `}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Day Content */}
            {(() => {
              const [day, periods] = days[activeDayIndex];
              const isToday = day === todayKey;

              return (
                <Card className={isToday ? "ring-2 ring-yellow-400" : ""}>

                  <SectionTitle>
                    {day} {isToday && "🔥"}
                  </SectionTitle>

                  <div className="space-y-3">

                    {Object.entries(periods).map(([period, value]) => {
                      const subject = findSubject(value);
                      const isCurrent =
                        isToday && period === currentPeriod;

                      let style = "bg-gray-50 border-gray-200";
                      if (subject) {
                        style = getColor(subject.course_code);
                      }

                      const timing = PERIOD_TIMINGS.find(
                        (p) => p.name === period
                      );

                      return (
                        <div
                          key={period}
                          className={`border rounded-xl p-3 ${style} ${
                            isCurrent
                              ? "ring-2 ring-black shadow-lg"
                              : ""
                          }`}
                        >
                          {timing && (
                            <p className="text-xs text-gray-500">
                              {timing.start} - {timing.end}
                            </p>
                          )}

                          <p className="text-sm font-semibold">
                            {subject
                              ? subject.course_title
                              : "Free"}
                          </p>

                          {subject && (
                            <p className="text-xs text-gray-600">
                              {subject.faculty_name} • {subject.room_no}
                            </p>
                          )}

                          {isCurrent && (
                            <span className="inline-block mt-2 text-xs font-bold bg-black text-white px-2 py-1 rounded">
                              NOW
                            </span>
                          )}
                        </div>
                      );
                    })}

                  </div>

                  <p className="text-center text-xs text-gray-500 mt-4">
                    Swipe ← → to change day
                  </p>

                </Card>
              );
            })()}

          </div>

          {/* 💻 DESKTOP (UNCHANGED) */}
          <div className="hidden md:block space-y-6">
          {days.map(([day, periods]) => {
            const isToday = day === todayKey;

            return (
              <Card key={day} className={isToday ? "ring-2 ring-yellow-400" : ""}>
                <SectionTitle>
                  {day} {isToday && "🔥"}
                </SectionTitle>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">

                  {Object.entries(periods).map(([period, value]) => {
                    const subject = findSubject(value);
                    const isCurrent =
                      isToday && period === currentPeriod;

                    let style = "bg-gray-50 border-gray-200";
                    if (subject) {
                      style = getColor(subject.course_code);
                    }

                    const timing = PERIOD_TIMINGS.find(
                      (p) => p.name === period
                    );

                    return (
                      <div
                        key={period}
                        className={`border rounded-xl p-4 ${style} min-w-0 ${
                          isCurrent ? "ring-2 ring-black shadow-md" : ""
                        }`}
                      >
                        {/* ⏰ TIME */}
                        {timing && (
                          <p className="text-xs text-gray-500">
                            {timing.start} - {timing.end}
                          </p>
                        )}

                        {/* 📘 SUBJECT */}
                        <p className="font-semibold break-words">
                          {subject ? subject.course_title : "Free"}
                        </p>

                        {/* 👨‍🏫 DETAILS */}
                        {subject && (
                          <p className="text-xs text-gray-600 break-words">
                            {subject.faculty_name} • {subject.room_no}
                          </p>
                        )}

                        {/* 🔥 CURRENT */}
                        {isCurrent && (
                          <span className="inline-block mt-2 text-xs font-bold bg-black text-white px-2 py-1 rounded">
                            NOW
                          </span>
                        )}
                      </div>
                    );
                  })}

                </div>
              </Card>
            );
          })}
        </div>

        </div>
      )}
    </div>
  );
}