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

  useEffect(() => {
    if (!data) {
      const saved = getData();
      if (saved) setData(saved);
      else router.push("/");
    }
  }, [data, setData, router]);

  const subjects = data?.subjects || [];

  if (!data) {
    return (
      <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
        Loading subjects...
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-gray-100 min-h-screen">

      {/* Header */}
      <h1 className="text-xl md:text-2xl font-bold mb-4">
        Course List
      </h1>

      {subjects.length === 0 && (
        <div className="text-gray-500">
          No subjects available
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

        {subjects.map((s, i) => (
          <Card key={i}>

            {/* Top Section */}
            <div className="flex justify-between items-start">

              <div>
                <SectionTitle>
                  {s.course_title || "Unknown Subject"}
                </SectionTitle>

                <p className="text-xs md:text-sm text-gray-500">
                  {s.course_code || "N/A"}
                </p>
              </div>

              {/* Credits Badge */}
              <div className="flex-shrink-0 whitespace-nowrap text-xs md:text-sm font-semibold bg-blue-100 text-blue-600 px-2 py-1 rounded">
                {s.credit ?? "N/A"} Credits
              </div>

            </div>

            {/* Divider */}
            <div className="my-3 border-t" />

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs md:text-sm">

              <p>
                <span className="text-gray-500">Category:</span>{" "}
                {s.category || "N/A"}
              </p>

              <p>
                <span className="text-gray-500">Slot:</span>{" "}
                {s.slot || "N/A"}
              </p>

              <p className="col-span-2">
                <span className="text-gray-500">Faculty:</span>{" "}
                {s.faculty_name || "N/A"}
              </p>

              <p className="col-span-2">
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
