export const GRADE_RULES = [
  { grade: "O", min: 91 },
  { grade: "A+", min: 81 },
  { grade: "A", min: 71 },
  { grade: "B+", min: 61 },
  { grade: "B", min: 56 },
  { grade: "C", min: 50 },
  { grade: "F", min: 0 },
];

// Get grade from %
export function getGrade(percent) {
  return GRADE_RULES.find((g) => percent >= g.min)?.grade || "F";
}

// Core prediction logic
export function predictGrade({ obtained, currentMax, targetGrade }) {
  const totalMax = 100;
  const futureMax = totalMax - currentMax;

  const rule = GRADE_RULES.find((g) => g.grade === targetGrade);
  if (!rule) return null;

  const requiredTotal = (rule.min / 100) * totalMax;
  const needed = requiredTotal - obtained;

  // Already achieved
  if (needed <= 0) {
    return {
      status: "achieved",
      message: `You already secured ${targetGrade}`,
    };
  }

  // Impossible
  if (needed > futureMax) {
    const maxPossiblePercent =
      ((obtained + futureMax) / totalMax) * 100;

    return {
      status: "impossible",
      message: `Not possible. Max possible: ${getGrade(
        maxPossiblePercent
      )}`,
    };
  }

  return {
    status: "possible",
    required: needed.toFixed(1),
    futureMax,
  };
}