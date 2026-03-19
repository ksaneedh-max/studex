"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { getData } from "@/lib/storage";
import { useRouter } from "next/navigation";

// UI
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

export default function Attendance() {
  const router = useRouter();
  const { data, setData } = useAppStore();

  useEffect(() => {
    if (!data) {
      const saved = getData();
      if (saved) setData(saved);
      else router.push("/");
    }
  }, [data, setData, router]);

  const attendance = data?.attendance || [];

  if (!data) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen">
        Loading attendance...
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">

      <h1 className="text-2xl font-bold mb-4">
        Attendance Overview
      </h1>

      {attendance.length === 0 && (
        <div className="text-gray-500">
          No attendance data available
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

        {attendance.map((c, i) => {
          const total = c.total || 0;
          const absent = c.absent || 0;
          const present = total - absent;
          const percentage = c.percentage || 0;

          // 🔴 REQUIRED
          let required = 0;
          try {
            required = Math.ceil((0.75 * total - present) / 0.75);
          } catch {
            required = 0;
          }
          if (required < 0) required = 0;

          // 🟢 MARGIN
          let margin = 0;
          try {
            margin = Math.floor((present - 0.75 * total) / 0.75);
          } catch {
            margin = 0;
          }
          if (margin < 0) margin = 0;

          // 🚦 Status
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
            <Card key={i}>

              {/* Title */}
              <h2 className="text-lg font-semibold">
                {c.course_title || "Unknown"}
              </h2>

              {/* Sub info */}
              <p className="text-sm text-gray-500">
                {c.code || "N/A"} • {c.category || "N/A"}
              </p>

              {/* Stats */}
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">

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

                {/* 🔥 Required / Margin */}
                {percentage < 75 ? (
                  <p className="text-red-600 font-medium">
                    Required: {required}
                  </p>
                ) : (
                  <p className="text-green-600 font-medium">
                    Margin: {margin}
                  </p>
                )}

              </div>

              {/* Footer */}
              <div className="mt-4 flex justify-between items-center">

                <div className="text-sm text-gray-500">
                  Present: {present}
                </div>

                <Badge text={status} type={type} />

              </div>

            </Card>
          );
        })}
      </div>
    </div>
  );
}