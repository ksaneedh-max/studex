"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useAppStore } from "@/store/useAppStore";
import { getData, getOverrides, saveOverrides } from "@/lib/storage";
import { useRouter } from "next/navigation";

import timetableData from "@/data/timetable.json";
import plannerData from "@/data/planner.json";

import {
  getCurrentPeriod,
  getNextClassInfo,
  getTodayStr,
  getTodayDayOrder,
} from "@/lib/timetable";

import MobileTimetable from "@/components/timetable/MobileTimetable";
import DesktopTimetable from "@/components/timetable/DesktopTimetable";
import Card from "@/components/ui/Card";

export default function Timetable() {
  const router = useRouter();
  const { data, setData } = useAppStore();

  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [overrides, setOverrides] = useState({});

  const currentRef = useRef(null);

  // =========================
  // 🔐 LOAD DATA
  // =========================
  useEffect(() => {
    if (!data) {
      const saved = getData();
      if (saved) setData(saved);
      else router.push("/");
    }
  }, [data, setData, router]);

  // =========================
  // 🔁 OVERRIDES
  // =========================
  useEffect(() => {
    setOverrides(getOverrides() || {});
  }, []);

  useEffect(() => {
    saveOverrides(overrides);
  }, [overrides]);

  // =========================
  // 🔥 SAFE FALLBACK VALUES (IMPORTANT FIX)
  // =========================
  const subjects = data?.subjects || [];
  const batch = data?.batch || "1";

  const timetable =
    batch === "1" ? timetableData.batch1 : timetableData.batch2;

  const yearData = plannerData["2026"] || {};

  // =========================
  // 📅 TODAY
  // =========================
  const todayStr = getTodayStr();
  const todayOrder = getTodayDayOrder(yearData, todayStr);
  const todayKey = todayOrder ? `Day${todayOrder}` : null;

  const currentPeriod = getCurrentPeriod();
  const nextClass = getNextClassInfo();

  // =========================
  // ✅ FIXED DAY ORDER (SAFE)
  // =========================
  const days = useMemo(() => {
    if (!timetable) return [];

    return ["Day1", "Day2", "Day3", "Day4", "Day5"]
      .map((key) => [key, timetable[key]])
      .filter(([_, val]) => val);
  }, [timetable]);

  useEffect(() => {
    if (!todayKey) return;

    const index = days.findIndex(([d]) => d === todayKey);
    if (index !== -1) setActiveDayIndex(index);
  }, [todayKey, days]);

  // =========================
  // ✅ SUBJECT MATCHING
  // =========================
  const findSubject = (slotValue) => {
    if (!slotValue) return null;

    const slots = slotValue.split("/").map((s) => s.trim());

    return (
      subjects.find((s) => {
        if (!s.slot) return false;

        if (slots.includes(s.slot)) return true;

        return slots.some(
          (slot) =>
            slot.includes(s.slot) || s.slot.includes(slot)
        );
      }) || null
    );
  };

  // =========================
  // 🎨 COLOR MAP
  // =========================
  const subjectColorMap = useMemo(() => {
    const colors = [
      "bg-blue-100 border-blue-300",
      "bg-green-100 border-green-300",
      "bg-purple-100 border-purple-300",
      "bg-yellow-100 border-yellow-300",
      "bg-pink-100 border-pink-300",
      "bg-indigo-100 border-indigo-300",
      "bg-red-100 border-red-300",
      "bg-teal-100 border-teal-300",
    ];

    const map = {};
    let i = 0;

    subjects.forEach((s) => {
      if (!map[s.course_code]) {
        map[s.course_code] = colors[i % colors.length];
        i++;
      }
    });

    return map;
  }, [subjects]);

  // =========================
  // ✏️ OVERRIDE HANDLER
  // =========================
  const handleOverride = (day, period, courseCode) => {
    const key = `${day}-${period}`;

    setOverrides((prev) => ({
      ...prev,
      [key]: courseCode,
    }));
  };

  const handleResetAll = () => {
    setOverrides({});
  };

  // =========================
  // 📍 AUTO SCROLL
  // =========================
  useEffect(() => {
    currentRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [activeDayIndex, currentPeriod]);

  // =========================
  // 👆 SWIPE NAVIGATION
  // =========================
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

  // =========================
  // 🚨 SAFE RETURN AFTER HOOKS (CRITICAL FIX)
  // =========================
  if (!data) {
    return <div className="p-6">Loading...</div>;
  }

  // =========================
  // 🚀 UI
  // =========================
  return (
    <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">
            Day Order Timetable
          </h1>

          <div className="text-sm text-gray-500 space-y-1">
            <p>Batch {batch}</p>

            {nextClass ? (
              <p className="text-blue-600 font-medium">
                ⏱ {nextClass.minutesLeft} mins to {nextClass.period}
              </p>
            ) : (
              <p className="text-green-600 font-medium">
                🎉 No more classes today
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          {isEditing && (
            <button
              onClick={handleResetAll}
              className="px-3 py-1.5 text-sm rounded-lg border bg-red-50 text-red-600 hover:bg-red-100"
            >
              Reset All
            </button>
          )}

          <button
            onClick={() => setIsEditing((p) => !p)}
            className={`px-3 py-1.5 text-sm rounded-lg border transition ${
              isEditing
                ? "bg-black text-white"
                : "bg-white hover:bg-gray-100"
            }`}
          >
            {isEditing ? "Done" : "Edit Optional"}
          </button>
        </div>
      </div>

      <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        {!todayKey && (
          <Card className="mb-4">
            <p className="text-gray-500 text-center">
              🎉 Holiday / No classes today
            </p>
          </Card>
        )}

        <MobileTimetable
          days={days}
          activeDayIndex={activeDayIndex}
          setActiveDayIndex={setActiveDayIndex}
          todayKey={todayKey}
          currentPeriod={currentPeriod}
          findSubject={findSubject}
          currentRef={currentRef}
          isEditing={isEditing}
          overrides={overrides}
          handleOverride={handleOverride}
          subjects={subjects}
          subjectColorMap={subjectColorMap}
        />

        <DesktopTimetable
          days={days}
          todayKey={todayKey}
          currentPeriod={currentPeriod}
          findSubject={findSubject}
          currentRef={currentRef}
          isEditing={isEditing}
          overrides={overrides}
          handleOverride={handleOverride}
          subjects={subjects}
          subjectColorMap={subjectColorMap}
        />
      </div>
    </div>
  );
}