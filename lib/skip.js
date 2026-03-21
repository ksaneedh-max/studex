import { filterPeriods } from "@/lib/timetable";

// =========================
// 📅 BUILD DAY ORDER MAP
// =========================
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

// =========================
// 📅 GET ALL FUTURE DATES
// =========================
function getFutureDates(start, end) {
  const dates = [];
  let current = new Date(start);

  while (current <= new Date(end)) {
    dates.push(current.toISOString().slice(0, 10));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

// =========================
// 📅 FIND LAST WORKING DAY
// =========================
function getLastWorkingDay(plannerData) {
  let last = null;

  Object.values(plannerData).forEach((month) => {
    month.forEach((d) => {
      if (d.event === "Last Working Day") {
        last = d.date;
      }
    });
  });

  return last;
}

// =========================
// 🧠 SUBJECT FINDER (reuse logic)
// =========================
function findSubjectFromSlot(slotValue, subjects) {
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
}

// =========================
// 🧠 FIND COURSE KEY
// =========================
function findCourseKey(resultMap, subject, isLab) {
  return Object.keys(resultMap).find((key) => {
    if (!key.startsWith(subject.course_code)) return false;

    if (isLab) return key.includes("Practical");
    return key.includes("Theory");
  });
}

// =========================
// 🚀 MAIN FUNCTION
// =========================
export function calculateSkipPlanner({
  plannerData,
  timetable,
  subjects,
  overrides,
  attendance,
  startDate,
  threshold = 75,
}) {
  if (!attendance?.length) return [];

  const lastDay = getLastWorkingDay(plannerData);
  if (!lastDay) return [];

  const dayOrderMap = buildDayOrderMap(plannerData);

  const futureDates = getFutureDates(startDate, lastDay);

  // =========================
  // 🧠 INITIAL STATE
  // =========================
  const resultMap = {};

  attendance.forEach((c) => {
    resultMap[c.id] = {
      ...c,
      total: Number(c.total) || 0,
      absent: Number(c.absent) || 0,
      remaining: 0,
    };
  });

  // =========================
  // 📅 COUNT FUTURE CLASSES
  // =========================
  futureDates.forEach((date) => {
    const dayKey = dayOrderMap[date];
    if (!dayKey || !timetable[dayKey]) return;

    const periods = timetable[dayKey];

    filterPeriods(periods).forEach(([period, value]) => {
      const overrideKey = `${dayKey}-${period}`;

      const finalValue =
        overrides && overrideKey in overrides
          ? overrides[overrideKey]
          : value;

      if (!finalValue) return;

      let subject;

      if (subjects.some((s) => s.course_code === finalValue)) {
        subject =
          subjects.find((s) => s.course_code === finalValue) || null;
      } else {
        subject = findSubjectFromSlot(finalValue, subjects);
      }

      if (!subject) return;

      const isLab = finalValue.startsWith("P");
      const key = findCourseKey(resultMap, subject, isLab);

      if (!key) return;

      resultMap[key].remaining += 1;
    });
  });

  // =========================
  // 📊 FINAL CALCULATIONS
  // =========================
  return Object.values(resultMap).map((c) => {
    const present = c.total - c.absent;
    const projectedTotal = c.total + c.remaining;

    const mustAttend = Math.max(
      0,
      Math.ceil((threshold / 100) * projectedTotal - present)
    );

    const safeSkips = Math.max(0, c.remaining - mustAttend);

    const finalIfSkipAll =
      projectedTotal > 0
        ? Number(((present / projectedTotal) * 100).toFixed(2))
        : 0;

    return {
      ...c,
      present,
      projectedTotal,
      mustAttend,
      safeSkips,
      finalIfSkipAll,
    };
  });
}