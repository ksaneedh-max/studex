"use client";

import { useEffect, useMemo } from "react";
import { useAppStore } from "@/store/useAppStore";
import { getData } from "@/lib/storage";
import { useRouter } from "next/navigation";

import Card from "@/components/ui/Card";
import SectionTitle from "@/components/ui/SectionTitle";

export default function Dashboard() {
  const router = useRouter();
  const { data, setData } = useAppStore();

  useEffect(() => {
    if (!data) {
      const saved = getData();

      if (saved) setData(saved);
      else router.push("/");
    }
  }, [data, setData, router]);

  const safeData = data || {};

  const student = safeData.student || {};
  const marks = safeData.marks || [];
  const raw = safeData.raw || {};

  const attendanceSummary = raw?.attendance?.attendance || {};

  const overallAttendance =
    attendanceSummary?.overall_attendance ?? 0;

  const totalConducted =
    attendanceSummary?.total_hours_conducted ?? 0;

  const totalAbsent =
    attendanceSummary?.total_hours_absent ?? 0;

  const totalPresent = totalConducted - totalAbsent;

  const marksSummary = useMemo(() => {
    let obtained = 0;
    let max = 0;

    try {
      marks.forEach((m) => {
        (m.tests || []).forEach((t) => {
          obtained += Number(t.obtained || 0);
          max += Number(t.max || 0);
        });
      });
    } catch {}

    const percent =
      max > 0 ? ((obtained / max) * 100).toFixed(1) : "0";

    return { obtained, max, percent };
  }, [marks]);

  const facultyAdvisor =
    raw?.timetable?.advisors?.faculty_advisor || {};

  const academicAdvisor =
    raw?.timetable?.advisors?.academic_advisor || {};

  if (!data) {
    return (
      <div className="p-4 md:p-6 min-h-screen bg-gray-100">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 bg-gray-100 min-h-screen">

      {/* 👤 PROFILE */}
      <Card>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">

          <div>
            <h2 className="text-xl md:text-2xl font-bold">
              {student.name || "N/A"}
            </h2>
            <p className="text-gray-500 text-sm">
              {student.registration_number || "N/A"}
            </p>
          </div>

          <div className="text-sm text-gray-600 space-y-1">
            <p>{student.department || "N/A"}</p>
            <p>Semester {student.semester || "N/A"}</p>
          </div>

        </div>
      </Card>

      {/* 📊 STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

        {/* Attendance */}
        <Card>
          <p className="text-sm text-gray-500 mb-1">
            Attendance
          </p>

          <p className="text-3xl font-bold">
            {overallAttendance}%
          </p>

          <p className="text-xs text-gray-500 mt-1">
            {totalPresent} / {totalConducted} Present
          </p>
        </Card>

        {/* Marks */}
        <Card>
          <p className="text-sm text-gray-500 mb-1">
            Marks
          </p>

          <p className="text-lg">
            {marksSummary.obtained} / {marksSummary.max}
          </p>

          <p className="text-2xl font-bold">
            {marksSummary.percent}%
          </p>
        </Card>

        {/* Classes */}
        <Card>
          <p className="text-sm text-gray-500 mb-1">
            Classes
          </p>

          <div className="text-sm space-y-1">
            <p>Total: {totalConducted}</p>
            <p>Absent: {totalAbsent}</p>
          </div>
        </Card>

      </div>

      {/* 👨‍🏫 ADVISORS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <Card>
          <p className="text-sm text-gray-500 mb-2">
            Faculty Advisor
          </p>

          <p className="font-semibold">
            {facultyAdvisor.name || "N/A"}
          </p>

          <p className="text-sm text-gray-600">
            {facultyAdvisor.email || "N/A"}
          </p>

          <p className="text-sm text-gray-600">
            {facultyAdvisor.phone || "N/A"}
          </p>
        </Card>

        <Card>
          <p className="text-sm text-gray-500 mb-2">
            Academic Advisor
          </p>

          <p className="font-semibold">
            {academicAdvisor.name || "N/A"}
          </p>

          <p className="text-sm text-gray-600">
            {academicAdvisor.email || "N/A"}
          </p>

          <p className="text-sm text-gray-600">
            {academicAdvisor.phone || "N/A"}
          </p>
        </Card>

      </div>

    </div>
  );
}