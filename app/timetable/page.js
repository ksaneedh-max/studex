"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { getData } from "@/lib/storage";
import { useRouter } from "next/navigation";

import timetableData from "@/data/timetable.json";

import Card from "@/components/ui/Card";
import SectionTitle from "@/components/ui/SectionTitle";

// =========================
// 🎨 Subject Color Generator
// =========================
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

// =========================
// ⏱ Fake Current Period (you can improve later)
// =========================
function getCurrentPeriod() {
  const hour = new Date().getHours();

  if (hour < 9) return "P1";
  if (hour < 10) return "P2";
  if (hour < 11) return "P3";
  if (hour < 12) return "P4";
  if (hour < 13) return "P5";
  if (hour < 14) return "P6";
  if (hour < 15) return "P7";
  if (hour < 16) return "P8";

  return null;
}

export default function Timetable() {
  const router = useRouter();
  const { data, setData } = useAppStore();

  useEffect(() => {
    if (!data) {
      const saved = getData();
      if (saved) setData(saved);
      else router.push("/");
    }
  }, [data, setData, router]);

  const subjects = data?.subjects || [];
  const batch = data?.batch || "1";

  if (!data) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen">
        Loading timetable...
      </div>
    );
  }

  const timetable =
    batch === "1"
      ? timetableData.batch1
      : timetableData.batch2;

  const currentPeriod = getCurrentPeriod();

  // =========================
  // 🧠 Slot → Subject mapping
  // =========================
  const findSubject = (slotValue) => {
    if (!slotValue) return null;

    const possibleSlots = slotValue
      .split("/")
      .map((s) => s.trim());

    if (slotValue.startsWith("P")) {
      return subjects.find((s) => s.slot === "LAB");
    }

    return subjects.find((sub) =>
      possibleSlots.includes(sub.slot)
    );
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">

      {/* 🔥 Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Day Order Timetable
        </h1>
        <p className="text-sm text-gray-500">
          Batch {batch}
        </p>
      </div>

      <div className="space-y-6">

        {Object.entries(timetable).map(([day, periods]) => (
          <Card key={day}>

            {/* Day Title */}
            <SectionTitle>
              {day}
            </SectionTitle>

            {/* Period Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">

              {Object.entries(periods).map(([period, value]) => {
                const subject = findSubject(value);
                const isCurrent = period === currentPeriod;

                // 🎨 Decide style
                let style =
                  "bg-gray-100 border-gray-200";

                if (subject) {
                  style = getColor(subject.course_code);
                }

                if (!subject) {
                  style = "bg-gray-50 border-gray-200";
                }

                return (
                  <div
                    key={period}
                    className={`border rounded-xl p-3 transition-all duration-200
                      ${style}
                      ${isCurrent ? "ring-2 ring-black scale-[1.02]" : ""}
                    `}
                  >
                    {/* Period */}
                    <p className="text-xs text-gray-500">
                      {period}
                    </p>

                    {/* Subject */}
                    <p className="text-sm font-semibold mt-1">
                      {subject
                        ? subject.course_title
                        : "Free"}
                    </p>

                    {/* Faculty + Room */}
                    {subject && (
                      <p className="text-xs text-gray-600 mt-1">
                        {subject.faculty_name || "N/A"} •{" "}
                        {subject.room_no || "N/A"}
                      </p>
                    )}

                    {/* Code */}
                    {subject && (
                      <p className="text-[10px] text-gray-500 mt-1">
                        {subject.course_code}
                      </p>
                    )}

                    {/* Slot */}
                    <p className="text-[10px] text-gray-400 mt-1">
                      {value}
                    </p>
                  </div>
                );
              })}
            </div>

          </Card>
        ))}

      </div>
    </div>
  );
}