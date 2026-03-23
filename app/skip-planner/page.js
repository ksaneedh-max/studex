"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useAppStore } from "@/store/useAppStore";
import { getData } from "@/lib/storage";

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
  const [showTimetablePopup, setShowTimetablePopup] = useState(false);

  // ✅ NEW
  const [overrides, setOverrides] = useState({});

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
  // 🔥 LOAD OVERRIDES (FIX)
  // =========================
  useEffect(() => {
    const loadOverrides = async () => {
      const session_id = localStorage.getItem("session_id");
      if (!session_id) return;

      // 1️⃣ local
      try {
        const localKey = `timetable_overrides_${session_id}`;
        const local = JSON.parse(localStorage.getItem(localKey)) || {};
        if (Object.keys(local).length > 0) {
          setOverrides(local);
        }
      } catch {}

      // 2️⃣ server
      try {
        const res = await fetch(`/api/timetable?session_id=${session_id}`);
        const data = await res.json();

        if (data.success && data.overrides) {
          setOverrides(data.overrides);

          const localKey = `timetable_overrides_${session_id}`;
          localStorage.setItem(localKey, JSON.stringify(data.overrides));
        }
      } catch {}
    };

    loadOverrides();
  }, []);

  // =========================
  // 🔔 SKIP NOTICE (ONCE)
  // =========================
  useEffect(() => {
    const seen = localStorage.getItem("skip_notice_seen");
    if (!seen) setShowNotice(true);
  }, []);

  // =========================
  // ⚙️ TIMETABLE POPUP (FIXED)
  // =========================
  useEffect(() => {
    const seen = localStorage.getItem("timetable_notice_seen");

    if (!seen || (overrides && Object.keys(overrides).length > 0)) {
      setShowTimetablePopup(true);
    }
  }, [overrides]);

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

  const today = getTodayStr();

  const result = calculateSkipPlanner({
    plannerData: plannerData["2026"],
    timetable,
    subjects,
    overrides, // ✅ FIX
    attendance,
    startDate: today,
  });

  return (
    <div className="p-4 md:p-6 bg-gray-100 min-h-screen">

      {/* HEADER */}
      <h1 className="text-xl md:text-2xl font-bold mb-4">
        Semester Skip Planner
      </h1>

      {/* 🔔 SKIP NOTICE */}
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
              <button
                onClick={() => {
                  localStorage.setItem("skip_notice_seen", "true");
                  setShowNotice(false);
                }}
                className="flex-1 border py-2 rounded-md text-sm"
              >
                Don't show again
              </button>

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

      {/* 🔵 TIMETABLE BANNER */}
      <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start justify-between gap-3">
        <div className="text-sm">
          <p className="font-medium text-blue-800">
            ⚙️ Predictions use your timetable
          </p>
          <p className="text-blue-700 text-xs mt-0.5">
            Changed any class slots or labs? Update your timetable for accurate results
          </p>
        </div>

        <button
          onClick={() => router.push("/timetable")}
          className="shrink-0 bg-blue-600 text-white text-xs px-3 py-1.5 rounded-md hover:bg-blue-700"
        >
          Edit
        </button>
      </div>

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

              <h2 className="text-base md:text-lg font-semibold">
                {c.course_title ?? "Unknown"}
              </h2>

              <p className="text-xs text-gray-500">
                {c.code || "N/A"} • {c.category || "N/A"}
              </p>

              <div className="mt-3 space-y-1 text-xs md:text-sm">
                <p><span className="text-gray-500">Current:</span> {percentage}%</p>
                <p><span className="text-gray-500">Remaining Classes:</span> {c.remaining}</p>
                <p><span className="text-gray-500">Projected Total:</span> {c.projectedTotal}</p>
              </div>

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