// =========================
// 🎯 Grade Mapping
// =========================
export const gradePoints = {
  O: 10,
  "A+": 9,
  A: 8,
  "B+": 7,
  B: 6,
  C: 5,
  F: 0,
};

// =========================
// 🧮 Calculate SGPA
// =========================
export function calculateSGPA(subjects, grades) {
  let totalCredits = 0;
  let totalPoints = 0;

  subjects.forEach((sub) => {
    const grade = grades[sub.course_code];
    const point = gradePoints[grade];

    // skip invalid
    if (!point || !sub.credit) return;

    totalCredits += sub.credit;
    totalPoints += sub.credit * point;
  });

  return totalCredits
    ? (totalPoints / totalCredits).toFixed(2)
    : "0.00";
}