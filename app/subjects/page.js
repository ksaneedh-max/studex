"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { getData } from "@/lib/storage";
import { useRouter } from "next/navigation";

// UI
import Card from "@/components/ui/Card";
import SectionTitle from "@/components/ui/SectionTitle";

export default function Subjects() {
  const router = useRouter();
  const { data, setData } = useAppStore();

  // 🔁 Load data
  useEffect(() => {
    if (!data) {
      const saved = getData();
      if (saved) setData(saved);
      else router.push("/");
    }
  }, [data, setData, router]);

  const subjects = data?.subjects || [];

  // ⛔ prevent crash AFTER hooks
  if (!data) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen">
        Loading subjects...
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">

      {/* Header */}
      <h1 className="text-2xl font-bold mb-4">
        Course List
      </h1>

      {/* Empty state */}
      {subjects.length === 0 && (
        <div className="text-gray-500">
          No subjects available
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

        {subjects.map((s, i) => (
          <Card key={i}>

            {/* Title */}
            <SectionTitle>
              {s.course_title || "Unknown Subject"}
            </SectionTitle>

            {/* Code */}
            <p className="text-sm text-gray-500">
              {s.course_code || "N/A"}
            </p>

            {/* Info */}
            <div className="mt-3 space-y-1 text-sm">

              <p>
                <span className="text-gray-500">Category:</span>{" "}
                {s.category || "N/A"}
              </p>

              <p>
                <span className="text-gray-500">Credits:</span>{" "}
                {s.credit ?? "N/A"}
              </p>

              <p>
                <span className="text-gray-500">Faculty:</span>{" "}
                {s.faculty_name || "N/A"}
              </p>

              <p>
                <span className="text-gray-500">Slot:</span>{" "}
                {s.slot || "N/A"}
              </p>

              <p>
                <span className="text-gray-500">Room:</span>{" "}
                {s.room_no || "N/A"}
              </p>

            </div>

          </Card>
        ))}

      </div>
    </div>
  );
}