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

  // ✅ NEW
  const [overrides, setOverrides] = useState({});

  useEffect(() => {
    if (!data) {
      const saved = getData();
      if (saved) setData(saved);
      else router.replace("/");
    }
  }, [data, setData, router]);

  // ✅ NEW (ONLY LOGIC ADD)
  useEffect(() => {
    const loadOverrides = async () => {
      const session_id = localStorage.getItem("session_id");
      if (!session_id) return;

      // local first
      try {
        const localKey = `timetable_overrides_${session_id}`;
        const local = JSON.parse(localStorage.getItem(localKey)) || {};
        if (Object.keys(local).length > 0) {
          setOverrides(local);
        }
      } catch {}

      // server sync
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

  if (!data) {
    return (
      <div className="p-4 md:p-6 min-h-screen bg-gray-100">
        Loading attendance...
      </div>
    );
  }

  const attendance = data?.attendance || [];
  const displayAttendance = predictedData || attendance;

  return (
    <div className="p-4 md:p-6 bg-gray-100 min-h-screen">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl md:text-2xl font-bold">
          Attendance Overview
        </h1>

        <div className="flex gap-2">
          {predictedData && (
            <button
              onClick={() => setPredictedData(null)}
              className="px-3 py-1.5 text-sm rounded-lg border bg-red-100 text-red-600 hover:bg-red-200"
            >
              Revert
            </button>
          )}

          <button
            onClick={() => setShowPredict(true)}
            className="px-3 py-1.5 text-sm rounded-lg border bg-black text-white hover:bg-gray-800"
          >
            Predict
          </button>
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

        {displayAttendance.map((c) => {
          const original = attendance.find((a) => a.id === c.id);

          const total = c.total || 0;
          const absent = c.absent || 0;
          const present = total - absent;

          const percentage = Number((c.percentage || 0).toFixed(1));
          const oldPercentage = Number(
            ((original?.percentage ?? percentage) || 0).toFixed(1)
          );

          const oldTotal = original?.total ?? total;
          const oldAbsent = original?.absent ?? absent;
          const oldPresent = oldTotal - oldAbsent;

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

          const oldRequired =
            oldTotal > 0
              ? Math.max(
                  0,
                  Math.ceil((MIN * oldTotal - 100 * oldPresent) / (100 - MIN))
                )
              : 0;

          const oldMargin = Math.max(
            0,
            Math.floor(
              (oldPresent - (MIN / 100) * oldTotal) / (MIN / 100)
            )
          );

          const getColor = (newVal, oldVal, reverse = false) => {
            if (!predictedData || newVal === oldVal) return "";
            const improved = reverse ? newVal < oldVal : newVal > oldVal;
            return improved
              ? "text-green-600 font-semibold"
              : "text-red-600 font-semibold";
          };

          const getArrow = (newVal, oldVal, reverse = false) => {
            if (!predictedData || newVal === oldVal) return "";
            const improved = reverse ? newVal < oldVal : newVal > oldVal;
            return improved ? "↑" : "↓";
          };

          let status = "Safe";
          let type = "safe";

          if (percentage < 75) {
            status = "Danger";
            type = "danger";
          } else if (percentage < 85) {
            status = "Warning";
            type = "warning";
          }

          const isTheory =
            c.category === "Theory" || c.id?.includes("Theory");

          const isPractical =
            c.category === "Practical" || c.id?.includes("Practical");

          return (
            <Card key={c.id}>

              {/* HEADER */}
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-base md:text-lg font-semibold">
                  {c.course_title ?? "Unknown"}
                </h2>

                <div className="flex gap-1">
                  {isTheory && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">
                      THEORY
                    </span>
                  )}
                  {isPractical && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500 text-white">
                      PRACTICAL
                    </span>
                  )}
                </div>
              </div>

              {/* SUB */}
              <p className="text-xs md:text-sm text-gray-500">
                {c.code || "N/A"} • {c.category || "N/A"}
              </p>

              {/* STATS */}
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs md:text-sm">

                <p>
                  <span className="text-gray-500">Conducted:</span>{" "}
                  {predictedData ? (
                    <span className="whitespace-nowrap">
                      {oldTotal} →{" "}
                      <span className={getColor(total, oldTotal)}>
                        {total} {getArrow(total, oldTotal)}
                      </span>
                    </span>
                  ) : total}
                </p>

                <p>
                  <span className="text-gray-500">Present:</span>{" "}
                  {predictedData ? (
                    <span className="whitespace-nowrap">
                      {oldPresent} →{" "}
                      <span className={getColor(present, oldPresent)}>
                        {present} {getArrow(present, oldPresent)}
                      </span>
                    </span>
                  ) : present}
                </p>

                <p>
                  <span className="text-gray-500">Attendance:</span>{" "}
                  {predictedData ? (
                    <span className="whitespace-nowrap">
                      {Math.round(oldPercentage)}% →{" "}
                      <span className={getColor(percentage, oldPercentage)}>
                        {Math.round(percentage)}% {getArrow(percentage, oldPercentage)}
                      </span>
                    </span>
                  ) : `${percentage}%`}
                </p>

                <p>
                  <span className="text-gray-500">Absent:</span>{" "}
                  {predictedData ? (
                    <span className="whitespace-nowrap">
                      {oldAbsent} →{" "}
                      <span className={getColor(absent, oldAbsent, true)}>
                        {absent} {getArrow(absent, oldAbsent, true)}
                      </span>
                    </span>
                  ) : absent}
                </p>

              </div>

              {/* FOOTER */}
              <div className="mt-4 flex justify-between items-center">

                {(() => {
                  const wasSafe = oldPercentage >= 75;
                  const isSafe = percentage >= 75;

                  if (predictedData) {

                    if (wasSafe && isSafe) {
                      const diff = margin - oldMargin;
                      return (
                        <div className="text-green-600 font-bold text-sm md:text-base whitespace-nowrap">
                          Margin: {oldMargin} → {margin} {diff !== 0 && (
                            <span>
                              {diff > 0 ? "↑" : "↓"} ({diff > 0 ? "+" : ""}{diff})
                            </span>
                          )}
                        </div>
                      );
                    }

                    if (wasSafe && !isSafe) {
                      const diff = required - oldMargin;
                      return (
                        <div className="text-red-600 font-bold text-sm md:text-base whitespace-nowrap">
                          Margin: {oldMargin} → Required: {required}{" "}
                          <span>
                            ↓ ({diff > 0 ? "+" : ""}{diff})
                          </span>
                        </div>
                      );
                    }

                    if (!wasSafe && isSafe) {
                      const diff = margin - oldRequired;
                      return (
                        <div className="text-green-600 font-bold text-sm md:text-base whitespace-nowrap">
                          Required: {oldRequired} → Margin: {margin}{" "}
                          <span>
                            ↑ ({diff > 0 ? "+" : ""}{diff})
                          </span>
                        </div>
                      );
                    }

                    if (!wasSafe && !isSafe) {
                      const diff = required - oldRequired;
                      const isBetter = diff < 0;

                      return (
                        <div className={`font-bold text-sm md:text-base whitespace-nowrap ${
                          isBetter ? "text-green-600" : "text-red-600"
                        }`}>
                          Required: {oldRequired} → {required}{" "}
                          {diff !== 0 && (
                            <span>
                              {isBetter ? "↓" : "↑"} ({diff > 0 ? "+" : ""}{diff})
                            </span>
                          )}
                        </div>
                      );
                    }
                  }

                  return percentage < 75 ? (
                    <div className="text-red-600 font-bold text-sm md:text-base">
                      Required: {required}
                    </div>
                  ) : (
                    <div className="text-green-600 font-bold text-sm md:text-base">
                      Margin: {margin}
                    </div>
                  );
                })()}

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
          overrides={overrides} // ✅ FIX
        />
      )}

    </div>
  );
}