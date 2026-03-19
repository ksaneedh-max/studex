"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { getData } from "@/lib/storage";
import { useRouter } from "next/navigation";

// UI
import Card from "@/components/ui/Card";
import SectionTitle from "@/components/ui/SectionTitle";

export default function Marks() {
  const router = useRouter();
  const { data, setData } = useAppStore();

  useEffect(() => {
    if (!data) {
      const saved = getData();
      if (saved) setData(saved);
      else router.push("/");
    }
  }, [data, setData, router]);

  // ✅ Filter only theory subjects
  const marks = (data?.marks || []).filter(
    (m) => m?.course_type !== "Practical"
  );

  if (!data) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen">
        Loading marks...
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">

      {/* Header */}
      <h1 className="text-2xl font-bold mb-4">
        Marks Overview
      </h1>

      {marks.length === 0 && (
        <div className="text-gray-500">
          No marks data available
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

        {marks.map((m, i) => {

          // 📊 Safe calculation
          let totalObtained = 0;
          let totalMax = 0;

          (m.tests || []).forEach((t) => {
            totalObtained += Number(t.obtained) || 0;
            totalMax += Number(t.max) || 0;
          });

          const percent =
            totalMax > 0
              ? ((totalObtained / totalMax) * 100).toFixed(2)
              : "0";

          return (
            <Card key={i}>

              {/* 🔥 Subject Title */}
              <SectionTitle>
                {m.course_title || "Unknown Subject"}
              </SectionTitle>

              {/* 🔥 Code */}
              <p className="text-sm text-gray-500">
                {m.code || "N/A"}
              </p>

              {/* 📊 Tests */}
              <div className="mt-3 space-y-2 text-sm">

                {(m.tests || []).length === 0 && (
                  <p className="text-gray-400">
                    No marks available
                  </p>
                )}

                {(m.tests || []).map((t, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between border-b pb-1"
                  >
                    <span className="font-medium">
                      {t.name}
                    </span>

                    <span>
                      {t.obtained}/{t.max}
                    </span>
                  </div>
                ))}

              </div>

              {/* 🔥 Total Section */}
              <div className="mt-4 pt-3 border-t text-center">

                {/* BIG TOTAL */}
                <div className="text-2xl font-bold">
                  {totalObtained} / {totalMax}
                </div>

                {/* SMALL OVERALL */}
                <div className="text-sm text-gray-500 mt-1">
                  Overall: {percent}%
                </div>

              </div>

            </Card>
          );
        })}
      </div>
    </div>
  );
}