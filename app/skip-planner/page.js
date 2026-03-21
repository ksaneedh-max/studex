"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useAppStore } from "@/store/useAppStore";
import { getData, getOverrides } from "@/lib/storage";

import plannerData from "@/data/planner.json";
import timetableData from "@/data/timetable.json";

import { getTodayStr } from "@/lib/timetable";
import { calculateSkipPlanner } from "@/lib/skip";

// UI
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

export default function SkipPlannerPage() {
  const router = useRouter();
  const { data, setData } = useAppStore();

  const [showNotice, setShowNotice] = useState(false);

  // =========================
  // 🔄 LOAD DATA
  // =========================
  useEffect(() => {
    if (!data) {
      const saved = getData();
      if (saved) setData(saved);
      else router.replace("/");
    }
  }, [data, setData, router]);

  // =========================
  // 🔔 SHOW NOTICE ONCE
  // =========================
  useEffect(() => {
    const seen = localStorage.getItem("skip_notice_seen");
    if (!seen) {
      setShowNotice(true);
    }
  }, []);

  if (!data) {
    return (
      <div className="p-4 min-h-screen bg-gray-100">
        Loading skip planner...
      </div>
    );
  }

  // =========================
  // 📦 PREP DATA
  // =========================
  const attendance = data.attendance || [];
  const subjects = data.subjects || [];
  const batch = data.batch || "1";

  const timetable =
    batch === "1" ? timetableData.batch1 : timetableData.batch2;

  const overrides = getOverrides();
  const today = getTodayStr();

  const result = calculateSkipPlanner({
    plannerData: plannerData["2026"],
    timetable,
    subjects,
    overrides,
    attendance,
    startDate: today,
  });

  // =========================
  // 🎨 UI
  // =========================
  return (
    <div className="p-4 md:p-6 bg-gray-100 min-h-screen">

      {/* HEADER */}
      <h1 className="text-xl md:text-2xl font-bold mb-4">
        Semester Skip Planner
      </h1>

      {/* 🔔 NOTICE MODAL */}
      {showNotice && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">

          <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-lg">

            <h2 className="text-lg font-semibold mb-2">
              ⚠️ Skip Planner
            </h2>

            <p className="text-sm text-gray-600 mb-4">
              This feature is a prediction and may not be 100% accurate.
            </p>

            <div className="flex gap-2">

              {/* NEVER SHOW AGAIN (LEFT) */}
              <button
                onClick={() => {
                  localStorage.setItem("skip_notice_seen", "true");
                  setShowNotice(false);
                }}
                className="flex-1 border py-2 rounded-md text-sm"
              >
                Don't show again
              </button>

              {/* OK (RIGHT) */}
              <button
                onClick={() => setShowNotice(false)}
                className="flex-1 bg-black text-white py-2 rounded-md text-sm"
              >
                OK
              </button>

            </div>
          </div>
        </div>
      )}

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

        {result.map((c) => {
          const percentage = Number((c.percentage || 0).toFixed(1));

          let status = "Safe";
          let type = "safe";

          if (percentage < 75) {
            status = "Danger";
            type = "danger";
          } else if (percentage < 85) {
            status = "Warning";
            type = "warning";
          }

          return (
            <Card key={c.id}>

              {/* TITLE */}
              <h2 className="text-base md:text-lg font-semibold">
                {c.course_title ?? "Unknown"}
              </h2>

              <p className="text-xs text-gray-500">
                {c.code || "N/A"} • {c.category || "N/A"}
              </p>

              {/* STATS */}
              <div className="mt-3 space-y-1 text-xs md:text-sm">

                <p>
                  <span className="text-gray-500">Current:</span>{" "}
                  {percentage}%
                </p>

                <p>
                  <span className="text-gray-500">Remaining Classes:</span>{" "}
                  {c.remaining}
                </p>

                <p>
                  <span className="text-gray-500">Projected Total:</span>{" "}
                  {c.projectedTotal}
                </p>

              </div>

              {/* RESULT */}
              <div className="mt-4 flex justify-between items-center">

                {c.safeSkips > 0 ? (
                  <div className="text-green-600 font-bold text-sm md:text-base">
                    Can Skip: {c.safeSkips}
                  </div>
                ) : (
                  <div className="text-red-600 font-bold text-sm md:text-base">
                    Must Attend: {c.mustAttend}
                  </div>
                )}

                <Badge text={status} type={type} />

              </div>

              {/* EXTRA INFO */}
              <div className="mt-2 text-xs text-gray-500">
                If skip all → {c.finalIfSkipAll}%
              </div>

            </Card>
          );
        })}

      </div>
    </div>
  );
}