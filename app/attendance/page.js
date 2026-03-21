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
    return <div className="p-4">Loading attendance...</div>;
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
              className="px-3 py-1.5 text-sm rounded-lg border bg-red-100 text-red-600"
            >
              Revert
            </button>
          )}

          <button
            onClick={() => setShowPredict(true)}
            className="px-3 py-1.5 text-sm rounded-lg border bg-black text-white"
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
              <div className="flex justify-between">
                <h2 className="font-semibold">{c.course_title}</h2>

                <div className="flex gap-1">
                  {isTheory && (
                    <span className="text-xs px-2 rounded bg-gray-200">
                      THEORY
                    </span>
                  )}
                  {isPractical && (
                    <span className="text-xs px-2 rounded bg-purple-500 text-white">
                      PRACTICAL
                    </span>
                  )}
                </div>
              </div>

              <p className="text-xs text-gray-500">
                {c.code} • {c.category}
              </p>

              {/* STATS */}
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">

                <p>
                  Conducted:{" "}
                  {predictedData ? (
                    <>
                      {oldTotal} →{" "}
                      <span className={`${getColor(total, oldTotal)} whitespace-nowrap`}>
                        {total} {getArrow(total, oldTotal)}
                      </span>
                    </>
                  ) : total}
                </p>

                <p>
                  Absent:{" "}
                  {predictedData ? (
                    <>
                      {oldAbsent} →{" "}
                      <span className={`${getColor(absent, oldAbsent, true)} whitespace-nowrap`}>
                        {absent} {getArrow(absent, oldAbsent, true)}
                      </span>
                    </>
                  ) : absent}
                </p>

                <p>
                  Attendance:{" "}
                  {predictedData ? (
                    <>
                      {oldPercentage}% →{" "}
                      <span className={`${getColor(percentage, oldPercentage)} whitespace-nowrap`}>
                        {percentage}% {getArrow(percentage, oldPercentage)}
                      </span>
                    </>
                  ) : `${percentage}%`}
                </p>

                <p>
                  Present:{" "}
                  {predictedData ? (
                    <>
                      {oldPresent} →{" "}
                      <span className={`${getColor(present, oldPresent)} whitespace-nowrap`}>
                        {present} {getArrow(present, oldPresent)}
                      </span>
                    </>
                  ) : present}
                </p>

              </div>

              {/* FOOTER (SCROLL FIX HERE) */}
              <div className="mt-4 flex justify-between items-center overflow-x-auto">

                <div className="flex-shrink-0 whitespace-nowrap">
                  {(() => {
                    const wasSafe = oldPercentage >= 75;
                    const isSafe = percentage >= 75;

                    if (predictedData) {

                      if (wasSafe && isSafe) {
                        const diff = margin - oldMargin;
                        return (
                          <div className="text-green-600 font-bold">
                            Margin: {oldMargin} → {margin}{" "}
                            {diff !== 0 && (
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
                          <div className="text-red-600 font-bold">
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
                          <div className="text-green-600 font-bold">
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
                          <div className={`font-bold ${
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
                      <div className="text-red-600 font-bold">
                        Required: {required}
                      </div>
                    ) : (
                      <div className="text-green-600 font-bold">
                        Margin: {margin}
                      </div>
                    );
                  })()}
                </div>

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