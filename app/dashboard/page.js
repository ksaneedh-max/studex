"use client";

import { useEffect, useMemo } from "react";
import { useAppStore } from "@/store/useAppStore";
import { getData } from "@/lib/storage";
import { useRouter } from "next/navigation";

import Card from "@/components/ui/Card";
import { User, Mail, Phone } from "lucide-react";

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

  if (!data) return <div className="p-6">Loading...</div>;

  /* ---------- HELPERS ---------- */
  const round1 = (val) => Number(val || 0).toFixed(1);

  /* ---------- DATA ---------- */
  const student = data.student || {};
  const marks = data.marks || [];
  const raw = data.raw || {};

  const attendanceSummary = raw?.attendance?.attendance || {};

  const overallAttendance = Number(
    attendanceSummary?.overall_attendance || 0
  );

  const totalConducted = Number(
    attendanceSummary?.total_hours_conducted || 0
  );

  const totalAbsent = Number(
    attendanceSummary?.total_hours_absent || 0
  );

  const totalPresent = useMemo(
    () => totalConducted - totalAbsent,
    [totalConducted, totalAbsent]
  );

  const marksSummary = useMemo(() => {
    let obtained = 0;
    let max = 0;

    marks.forEach((m) => {
      (m.tests || []).forEach((t) => {
        obtained += Number(t.obtained || 0);
        max += Number(t.max || 0);
      });
    });

    const percent = max > 0 ? (obtained / max) * 100 : 0;

    return { obtained, max, percent };
  }, [marks]);

  const facultyAdvisor =
    raw?.timetable?.advisors?.faculty_advisor || {};

  const academicAdvisor =
    raw?.timetable?.advisors?.academic_advisor || {};

  /* ---------- CIRCLE COMPONENT ---------- */
  const Circle = ({ value }) => {
    const radius = 45;
    const stroke = 6;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;

    const strokeDashoffset =
      circumference - (value / 100) * circumference;

    return (
      <div className="relative w-[110px] h-[110px]">
        <svg height="110" width="110">
          <circle
            stroke="#e5e7eb"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx="55"
            cy="55"
          />
          <circle
            stroke="#111111"
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            r={normalizedRadius}
            cx="55"
            cy="55"
            style={{
              transform: "rotate(-90deg)",
              transformOrigin: "50% 50%",
            }}
          />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center font-semibold">
          {round1(value)}%
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6 space-y-6 bg-gray-100 min-h-screen">

      {/* 👤 PROFILE */}
      <Card className="p-5 space-y-2">
        <h2 className="text-2xl font-bold">
          {student.name || "N/A"}
        </h2>

        <p className="text-sm text-gray-500">
          {student.registration_number || "N/A"}
        </p>

        <div className="flex flex-wrap gap-2 pt-2">
          <span className="px-3 py-1 bg-gray-200 text-xs rounded-full">
            {student.department || "N/A"}
          </span>
          <span className="px-3 py-1 bg-gray-200 text-xs rounded-full">
            {student.specialization || "N/A"}
          </span>
          <span className="px-3 py-1 bg-gray-200 text-xs rounded-full">
            Sem {student.semester || "N/A"}
          </span>
        </div>
      </Card>

      {/* 📊 GRAPH + DETAILS GRID */}
      <div className="grid grid-cols-2 gap-4">

        {/* Attendance Graph */}
        <Card className="p-4 flex flex-col items-center justify-center aspect-square">
          <p className="text-xs text-gray-500 mb-2">Attendance</p>
          <Circle value={overallAttendance} />
        </Card>

        {/* Marks Graph */}
        <Card className="p-4 flex flex-col items-center justify-center aspect-square">
          <p className="text-xs text-gray-500 mb-2">Marks</p>
          <Circle value={marksSummary.percent} />
        </Card>

        {/* Attendance Details */}
        <Card className="p-4 flex flex-col justify-center aspect-square">
          <p className="text-xs text-gray-500 mb-2">
            Attendance Details
          </p>

          <div className="text-sm space-y-1">
            <p>Present: {round1(totalPresent)}</p>
            <p>Total: {round1(totalConducted)}</p>
            <p>Absent: {round1(totalAbsent)}</p>
          </div>
        </Card>

        {/* Marks Details */}
        <Card className="p-4 flex flex-col justify-center aspect-square">
          <p className="text-xs text-gray-500 mb-2">
            Marks Details
          </p>

          <p className="text-sm">
            {round1(marksSummary.obtained)} /{" "}
            {round1(marksSummary.max)}
          </p>
        </Card>

      </div>

      {/* 👨‍🏫 FACULTY */}
      <div className="grid grid-cols-2 gap-4">

        {/* Faculty Advisor */}
        <Card className="p-4 flex flex-col justify-between aspect-square">

          {/* Top Row */}
          <div className="flex items-center gap-3">

            {/* Silhouette Icon */}
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              <User size={18} />
            </div>

            {/* Name + Role */}
            <div>
              <p className="text-xs text-gray-500">
                Faculty Advisor
              </p>
              <p className="font-semibold text-sm">
                {facultyAdvisor.name || "N/A"}
              </p>
            </div>

          </div>

          {/* Bottom Contact */}
          <div className="text-xs text-gray-600 space-y-1 mt-4">

            <div className="flex items-center gap-2">
              <Mail size={14} />
              <span>{facultyAdvisor.email || "N/A"}</span>
            </div>

            <div className="flex items-center gap-2">
              <Phone size={14} />
              <span>{facultyAdvisor.phone || "N/A"}</span>
            </div>

          </div>

        </Card>

        {/* Academic Advisor */}
        <Card className="p-4 flex flex-col justify-between aspect-square">

          {/* Top Row */}
          <div className="flex items-center gap-3">

            {/* Silhouette Icon */}
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              <User size={18} />
            </div>

            {/* Name + Role */}
            <div>
              <p className="text-xs text-gray-500">
                Academic Advisor
              </p>
              <p className="font-semibold text-sm">
                {academicAdvisor.name || "N/A"}
              </p>
            </div>

          </div>

          {/* Bottom Contact */}
          <div className="text-xs text-gray-600 space-y-1 mt-4">

            <div className="flex items-center gap-2">
              <Mail size={14} />
              <span>{academicAdvisor.email || "N/A"}</span>
            </div>

            <div className="flex items-center gap-2">
              <Phone size={14} />
              <span>{academicAdvisor.phone || "N/A"}</span>
            </div>

          </div>

        </Card>

      </div>

    </div>
  );
}