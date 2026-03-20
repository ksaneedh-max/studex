// =========================
// 📚 IMPORTS
// =========================
import { filterPeriods } from "@/lib/timetable";

// =========================
// 🧠 HELPERS
// =========================

// ✅ Map: date → DayX (from planner)
function buildDayOrderMap(plannerData) {
  const map = {};

  Object.values(plannerData).forEach((month) => {
    month.forEach((d) => {
      if (d.date && d.dayOrder) {
        map[d.date] = `Day${d.dayOrder}`;
      }
    });
  });

  return map;
}

// ✅ Generate date range (inclusive)
function getDateRange(start, end) {
  const dates = [];
  let current = new Date(start);

  while (current <= new Date(end)) {
    dates.push(current.toISOString().slice(0, 10));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

// =========================
// 🚀 MAIN FUNCTION
// =========================
export function predictAttendance({
  selectedDates,
  plannerData,
  timetable,
  subjects,
  overrides,
  attendance,
}) {
  if (!selectedDates || selectedDates.length === 0) return [];

  // =========================
  // 📅 DATE LOGIC
  // =========================
  const sorted = [...selectedDates].sort();

  const leaveStart = sorted[0];
  const leaveEnd = sorted[sorted.length - 1];

  const today = new Date().toISOString().slice(0, 10);

  // BEFORE leave → present
  const beforeLeaveDates = getDateRange(today, leaveStart).slice(0, -1);

  // LEAVE → absent
  const leaveDates = getDateRange(leaveStart, leaveEnd);

  // =========================
  // 📅 DAY ORDER MAP
  // =========================
  const dayOrderMap = buildDayOrderMap(plannerData);

  // =========================
  // 🧠 INITIAL STATE
  // =========================
  const resultMap = {};

  attendance.forEach((c) => {
    resultMap[c.id] = {
      ...c,
      total: Number(c.total) || 0,
      absent: Number(c.absent) || 0,
    };
  });

  // =========================
  // 🧠 SUBJECT MATCHING
  // =========================
  const findSubject = (slotValue) => {
    if (!slotValue) return null;

    const slots = slotValue.split("/").map((s) => s.trim());

    return (
      subjects.find((s) => {
        if (!s.slot) return false;

        return slots.some(
          (slot) =>
            slot.includes(s.slot) || s.slot.includes(slot)
        );
      }) || null
    );
  };

  // =========================
  // 🧠 FIND COURSE ENTRY (THEORY/LAB SAFE)
  // =========================
  const findCourseKey = (subject, isLab) => {
    return Object.keys(resultMap).find((key) => {
      if (!key.startsWith(subject.course_code)) return false;

      if (isLab) return key.includes("Practical");
      return key.includes("Theory");
    });
  };

  // =========================
  // 🟢 CASE 1: BEFORE LEAVE → PRESENT
  // =========================
  beforeLeaveDates.forEach((date) => {
    const dayKey = dayOrderMap[date];
    if (!dayKey || !timetable[dayKey]) return;

    const periods = timetable[dayKey];

    filterPeriods(periods).forEach(([period, value]) => {
      const subject = findSubject(value);
      if (!subject) return;

      const isLab = value.startsWith("P");
      const key = findCourseKey(subject, isLab);

      if (!key) return;

      resultMap[key].total += 1;
      // absent unchanged (present)
    });
  });

  // =========================
  // 🔴 CASE 2: LEAVE → ABSENT
  // =========================
  leaveDates.forEach((date) => {
    const dayKey = dayOrderMap[date];
    if (!dayKey || !timetable[dayKey]) return;

    const periods = timetable[dayKey];

    filterPeriods(periods).forEach(([period, value]) => {
      const subject = findSubject(value);
      if (!subject) return;

      const isLab = value.startsWith("P");
      const key = findCourseKey(subject, isLab);

      if (!key) return;

      resultMap[key].total += 1;
      resultMap[key].absent += 1;
    });
  });

  // =========================
  // 📊 FINAL CALCULATION
  // =========================
  return Object.values(resultMap).map((c) => {
    const present = c.total - c.absent;

    return {
      ...c,
      percentage:
        c.total > 0
          ? Number(((present / c.total) * 100).toFixed(2))
          : 0,
    };
  });
}