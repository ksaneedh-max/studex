"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { getData } from "@/lib/storage";
import { useRouter } from "next/navigation";

// UI
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

import PredictModal from "@/components/predict/PredictModal";

export default function Attendance() {
  const router = useRouter();
  const { data, setData } = useAppStore();

  const [showPredict, setShowPredict] = useState(false);
  const [predictedData, setPredictedData] = useState(null);

  useEffect(() => {
    if (!data) {
      const saved = getData();
      if (saved) setData(saved);
      else router.replace("/");
    }
  }, [data, setData, router]);

  if (!data) {
    return (
      <div className="p-4 md:p-6 min-h-screen bg-gray-100">
        Loading attendance...
      </div>
    );
  }

  const attendance = data?.attendance || [];

  // ✅ SWITCH BETWEEN ORIGINAL & PREDICTED
  const displayAttendance = predictedData || attendance;

  return (
    <div className="p-4 md:p-6 bg-gray-100 min-h-screen">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">

        <h1 className="text-xl md:text-2xl font-bold">
          Attendance Overview
        </h1>

        <div className="flex gap-2">

          {/* 🔁 REVERT */}
          {predictedData && (
            <button
              onClick={() => setPredictedData(null)}
              className="px-3 py-1.5 text-sm rounded-lg border bg-red-100 text-red-600 hover:bg-red-200"
            >
              Revert
            </button>
          )}

          {/* 📅 PREDICT */}
          <button
            onClick={() => setShowPredict(true)}
            className="px-3 py-1.5 text-sm rounded-lg border bg-black text-white hover:bg-gray-800"
          >
            Predict
          </button>

        </div>
      </div>

      {displayAttendance.length === 0 && (
        <div className="text-gray-500">
          No attendance data available
        </div>
      )}

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

        {displayAttendance.map((c) => {
          const total = c.total || 0;
          const absent = c.absent || 0;
          const present = total - absent;
          const percentage = Number(c.percentage) || 0;

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
            <Card
              key={c.id}
              className={
                predictedData
                  ? "border-2 border-blue-500"
                  : ""
              }
            >

              {/* TITLE */}
              <h2 className="text-base md:text-lg font-semibold">
                {c.course_title ?? "Unknown"}
              </h2>

              {/* ✅ FIXED HERE */}
              <p className="text-xs md:text-sm text-gray-500">
                {c.code || "N/A"} • {c.category || "N/A"}
              </p>

              {/* STATS */}
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs md:text-sm">

                <p>
                  <span className="text-gray-500">Conducted:</span>{" "}
                  {total}
                </p>

                <p>
                  <span className="text-gray-500">Absent:</span>{" "}
                  {absent}
                </p>

                <p>
                  <span className="text-gray-500">Attendance:</span>{" "}
                  {percentage}%
                </p>

                <p>
                  <span className="text-gray-500">Present:</span>{" "}
                  {present}
                </p>

              </div>

              {/* FOOTER */}
              <div className="mt-4 flex justify-between items-center">

                {percentage < 75 ? (
                  <div className="text-red-600 font-bold text-sm md:text-base">
                    Need: {required}
                  </div>
                ) : (
                  <div className="text-green-600 font-bold text-sm md:text-base">
                    Can skip: {margin}
                  </div>
                )}

                <Badge text={status} type={type} />

              </div>

            </Card>
          );
        })}
      </div>

      {/* MODAL */}
      {showPredict && (
        <PredictModal
          onClose={() => setShowPredict(false)}
          onApply={(result) => setPredictedData(result)}
          data={data}
        />
      )}

    </div>
  );
}