// =========================
// 🧰 Helpers
// =========================

// ✅ Extract base course code (robust for ALL cases)
function extractCode(key = "") {
  return key
    .replace(/Regular/g, "")
    .replace(/Theory/g, "")
    .replace(/Practical/g, "")
    .trim();
}

// ✅ Safe number parser
function toNumber(val, fallback = 0) {
  const num = Number(val);
  return isNaN(num) ? fallback : num;
}

// =========================
// 🧠 Build Course Map (SOURCE OF TRUTH)
// =========================
function buildCourseMap(raw) {
  const map = {};

  // 🔹 1. TIMETABLE (PRIMARY + MOST RELIABLE)
  const timetableCourses = raw?.timetable?.courses || [];

  timetableCourses.forEach((c) => {
    if (!c?.course_code) return;

    if (!map[c.course_code]) {
      map[c.course_code] = {
        code: c.course_code,
        title: c.course_title || c.course_code,
        category: c.category || "N/A",
        faculty: c.faculty_name || "",
        slot: c.slot || "",
        room: c.room_no || "",
        credit: toNumber(c.credit),
      };
    }
  });

  // 🔹 2. ATTENDANCE (FALLBACK)
  const attendanceCourses =
    raw?.attendance?.attendance?.courses || {};

  Object.entries(attendanceCourses).forEach(([key, c]) => {
    const code = extractCode(key);
    if (!code) return;

    if (!map[code]) {
      map[code] = {
        code,
        title: c?.course_title || code,
        category: c?.category || "N/A",
        faculty: c?.faculty_name || "",
        slot: c?.slot || "",
        room: c?.room_no || "",
        credit: 0,
      };
    }
  });

  return map;
}

// =========================
// 📅 Normalize Attendance
// =========================
function normalizeAttendance(raw, courseMap) {
  const courses =
    raw?.attendance?.attendance?.courses || {};

  return Object.entries(courses).map(([key, c]) => {
    const code = extractCode(key);
    const mapped = courseMap[code] || {};

    const total = toNumber(c?.hours_conducted);
    const absent = toNumber(c?.hours_absent);
    const present = total - absent;

    return {
      id: key,
      code,

      // ✅ CONSISTENT TITLE LOGIC
      course_title:
        mapped.title ||
        c?.course_title ||
        code,

      category:
        mapped.category ||
        c?.category ||
        "N/A",

      faculty:
        mapped.faculty ||
        c?.faculty_name ||
        "",

      slot: c?.slot || mapped.slot || "",
      room: c?.room_no || mapped.room || "",

      total,
      absent,
      present,

      percentage: toNumber(c?.attendance_percentage),

      type: key.includes("Practical")
        ? "Practical"
        : "Theory",
    };
  });
}

// =========================
// 📈 Normalize Marks
// =========================
function normalizeMarks(raw, courseMap) {
  const marksObj = raw?.attendance?.marks || {};

  return Object.entries(marksObj).map(([key, m]) => {
    const code = extractCode(key);
    const mapped = courseMap[code] || {};

    const tests = (m?.tests || []).map((t) => ({
      name: t?.test_name || "Unknown",
      obtained: toNumber(t?.obtained_marks),
      max: toNumber(t?.max_marks),
      percentage: toNumber(t?.percentage),
    }));

    const totalObtained = tests.reduce(
      (sum, t) => sum + t.obtained,
      0
    );

    const totalMax = tests.reduce(
      (sum, t) => sum + t.max,
      0
    );

    const overallPercentage =
      totalMax > 0
        ? Number(((totalObtained / totalMax) * 100).toFixed(2))
        : 0;

    return {
      id: key,
      code,

      // ✅ FIXED (THIS WAS YOUR BUG)
      course_title:
        mapped.title ||
        m?.course_title ||
        code,

      course_type: key.includes("Practical")
        ? "Practical"
        : "Theory",

      tests,

      totalObtained,
      totalMax,
      overallPercentage,
    };
  });
}

// =========================
// 📘 Normalize Subjects (Timetable)
// =========================
function normalizeSubjects(raw) {
  const subjects = raw?.timetable?.courses || [];

  const unique = {};

  subjects.forEach((c) => {
    if (!c?.course_code) return;

    if (!unique[c.course_code]) {
      unique[c.course_code] = {
        // ✅ MATCH UI EXACTLY
        course_code: c.course_code,
        course_title: c.course_title || c.course_code,

        category: c.category || "N/A",
        credit: Number(c.credit) || 0,

        faculty_name: c.faculty_name || "N/A",
        slot: c.slot || "",
        room_no: c.room_no || "N/A",
      };
    }
  });

  return Object.values(unique);
}

// =========================
// 🧍 Normalize Student
// =========================
function normalizeStudent(raw) {
  return raw?.attendance?.student_info || {};
}

// =========================
// 🧮 Main Normalize Function
// =========================
export function normalizeData(raw) {
  if (!raw || typeof raw !== "object") return null;

  try {
    const courseMap = buildCourseMap(raw);

    const student = normalizeStudent(raw);
    const attendance = normalizeAttendance(raw, courseMap);
    const marks = normalizeMarks(raw, courseMap);
    const subjects = normalizeSubjects(raw);

    const batch =
      raw?.timetable?.student_info?.batch || "1";

    return {
      student,
      attendance,
      marks,
      subjects,
      batch,

      // 🔥 Debug / future-proof
      courseMap,
      raw,
    };
  } catch (error) {
    console.error("❌ Normalization Error:", error);
    return null;
  }
}