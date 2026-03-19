"use client";

import { useEffect, useMemo } from "react";
import { useAppStore } from "@/store/useAppStore";
import { getData } from "@/lib/storage";
import { useRouter } from "next/navigation";

// UI Components
import Card from "@/components/ui/Card";
import SectionTitle from "@/components/ui/SectionTitle";

export default function Dashboard() {
  const router = useRouter();
  const { data, setData } = useAppStore();

  // 🔁 Load data from localStorage if needed
  useEffect(() => {
    if (!data) {
      const saved = getData();

      if (saved) {
        setData(saved);
      } else {
        router.push("/");
      }
    }
  }, [data, setData, router]);

  // 🧠 Safe fallback (IMPORTANT: before hooks)
  const safeData = data || {};

  const student = safeData.student || {};
  const marks = safeData.marks || [];
  const raw = safeData.raw || {};

  // 📊 Attendance summary
  const attendanceSummary = raw?.attendance?.attendance || {};

  const overallAttendance =
    attendanceSummary?.overall_attendance ?? 0;

  const totalConducted =
    attendanceSummary?.total_hours_conducted ?? 0;

  const totalAbsent =
    attendanceSummary?.total_hours_absent ?? 0;

  const totalPresent = totalConducted - totalAbsent;

  // 📈 Marks calculation (SAFE)
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
    } catch (err) {
      console.error("Marks error:", err);
    }

    const percent =
      max > 0 ? ((obtained / max) * 100).toFixed(2) : "0";

    return { obtained, max, percent };
  }, [marks]);

  // 👨‍🏫 Advisors
  const facultyAdvisor =
    raw?.timetable?.advisors?.faculty_advisor || {};

  const academicAdvisor =
    raw?.timetable?.advisors?.academic_advisor || {};

  // ⛔ After hooks
  if (!data) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-100 min-h-screen">

      {/* 🧍 PROFILE */}
      <Card>
        <SectionTitle>{student.name || "N/A"}</SectionTitle>
        <p className="text-gray-600">
          {student.registration_number || "N/A"}
        </p>
        <p className="text-gray-600">
          {student.department || "N/A"}
        </p>
        <p className="text-gray-600">
          Semester {student.semester || "N/A"}
        </p>
      </Card>

      {/* 📊 STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Attendance */}
        <Card>
          <SectionTitle>Attendance</SectionTitle>
          <p className="text-3xl font-bold">
            {overallAttendance}%
          </p>
          <p className="text-sm text-gray-500">
            {totalPresent} / {totalConducted} Present
          </p>
        </Card>

        {/* Marks */}
        <Card>
          <SectionTitle>Marks</SectionTitle>
          <p className="text-lg">
            {marksSummary.obtained} / {marksSummary.max}
          </p>
          <p className="text-2xl font-bold">
            {marksSummary.percent}%
          </p>
        </Card>

        {/* Classes */}
        <Card>
          <SectionTitle>Classes</SectionTitle>
          <p>Total: {totalConducted}</p>
          <p>Absent: {totalAbsent}</p>
        </Card>

      </div>

      {/* 👨‍🏫 ADVISORS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <Card>
          <SectionTitle>Faculty Advisor</SectionTitle>
          <p>{facultyAdvisor.name || "N/A"}</p>
          <p className="text-sm text-gray-600">
            {facultyAdvisor.email || "N/A"}
          </p>
          <p className="text-sm text-gray-600">
            {facultyAdvisor.phone || "N/A"}
          </p>
        </Card>

        <Card>
          <SectionTitle>Academic Advisor</SectionTitle>
          <p>{academicAdvisor.name || "N/A"}</p>
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