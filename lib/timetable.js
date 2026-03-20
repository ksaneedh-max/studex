export const EXCLUDED_PERIODS = ["P11", "P12"];

export const PERIOD_TIMINGS = [
  { name: "P1", start: "08:00", end: "08:50" },
  { name: "P2", start: "08:50", end: "09:40" },
  { name: "P3", start: "09:45", end: "10:35" },
  { name: "P4", start: "10:40", end: "11:30" },
  { name: "P5", start: "11:35", end: "12:25" },
  { name: "P6", start: "12:30", end: "13:20" },
  { name: "P7", start: "13:25", end: "14:15" },
  { name: "P8", start: "14:20", end: "15:10" },
  { name: "P9", start: "15:10", end: "16:00" },
  { name: "P10", start: "16:00", end: "16:50" },
];

export function getColor(code = "") {
  const colors = [
    "bg-blue-200 border-blue-400",
    "bg-green-200 border-green-400",
    "bg-purple-200 border-purple-400",
    "bg-yellow-200 border-yellow-400",
    "bg-pink-200 border-pink-400",
    "bg-indigo-200 border-indigo-400",

    "bg-red-200 border-red-400",
    "bg-orange-200 border-orange-400",
    "bg-teal-200 border-teal-400",
    "bg-cyan-200 border-cyan-400",
    "bg-lime-200 border-lime-400",
    "bg-emerald-200 border-emerald-400",
    "bg-violet-200 border-violet-400",
    "bg-rose-200 border-rose-400",
    "bg-sky-200 border-sky-400",
  ];

  let hash = 0;
  for (let i = 0; i < code.length; i++) {
    hash = code.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}

export function filterPeriods(periods) {
  return Object.entries(periods).filter(
    ([p]) => !EXCLUDED_PERIODS.includes(p)
  );
}

export function getCurrentPeriod() {
  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();

  let last = null;

  for (let p of PERIOD_TIMINGS) {
    const [sh, sm] = p.start.split(":").map(Number);
    const [eh, em] = p.end.split(":").map(Number);

    const start = sh * 60 + sm;
    const end = eh * 60 + em;

    if (minutes >= start && minutes < end) return p.name;
    if (minutes >= end) last = p.name;
  }

  const lastPeriod = PERIOD_TIMINGS[PERIOD_TIMINGS.length - 1];
  const [lh, lm] = lastPeriod.end.split(":").map(Number);
  const lastEnd = lh * 60 + lm;

  if (minutes >= lastEnd) return null;

  return last;
}

export function getNextClassInfo() {
  const now = new Date();
  const minutesNow = now.getHours() * 60 + now.getMinutes();

  for (let p of PERIOD_TIMINGS) {
    const [sh, sm] = p.start.split(":").map(Number);
    const start = sh * 60 + sm;

    if (minutesNow < start) {
      return {
        period: p.name,
        minutesLeft: start - minutesNow,
      };
    }
  }

  return null;
}

export function getTodayStr() {
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(
    t.getDate()
  ).padStart(2, "0")}`;
}

export function getTodayDayOrder(yearData, todayStr) {
  const map = {};

  Object.values(yearData).forEach((month) => {
    month.forEach((d) => {
      map[d.date] = d.dayOrder ?? null;
    });
  });

  return map[todayStr] ?? null;
}