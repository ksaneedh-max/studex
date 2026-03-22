import { getColor, PERIOD_TIMINGS } from "@/lib/timetable";

export default function PeriodCard({
  period,
  value,
  subject,
  isCurrent,
  currentRef,
  isEditing,
  day,
  subjects = [],
  override,
  onOverride,
}) {
  const hasOverride = override !== undefined;

  let finalSubject;

  if (hasOverride) {
    if (override === "") {
      finalSubject = null;
    } else {
      finalSubject =
        subjects.find((s) => s.course_code === override) || null;
    }
  } else {
    finalSubject = subject || null;
  }

  let style = "bg-white border-gray-200";

  if (finalSubject) {
    const colorKey =
      finalSubject.course_code ||
      finalSubject.slot ||
      finalSubject.course_title ||
      finalSubject.faculty_name ||
      value ||
      "DEFAULT";

    style = getColor(colorKey);
  }

  const timing = PERIOD_TIMINGS.find((p) => p.name === period);

  return (
    <div
      ref={isCurrent ? currentRef : null}
      className={`border rounded-xl p-3 md:p-4 ${style} ${
        isCurrent ? "ring-2 ring-black shadow-md" : ""
      }`}
    >
      {timing && (
        <p className="text-xs text-gray-500">
          {timing.start} - {timing.end}
        </p>
      )}

      <p className="font-semibold break-words flex items-center gap-1">
        {finalSubject ? finalSubject.course_title : "Free"}

        {hasOverride && !isEditing && (
          <span className="text-xs text-blue-600">✏️</span>
        )}
      </p>

      {finalSubject && (
        <p className="text-xs text-gray-600 break-words">
          {finalSubject.faculty_name} • {finalSubject.room_no}
        </p>
      )}

      {isEditing && (
        <select
          value={override ?? finalSubject?.course_code ?? ""}
          onChange={(e) => onOverride(day, period, e.target.value)}
          className="mt-2 w-full border rounded p-1 text-sm bg-white"
        >
          <option value="">Free</option>

          {/* ✅ FIXED: unique keys */}
          {subjects.map((s, i) => (
            <option key={`${s.course_code}-${i}`} value={s.course_code}>
              {s.course_title}
            </option>
          ))}
        </select>
      )}

      {isCurrent && (
        <span className="inline-block mt-2 text-xs font-bold bg-black text-white px-2 py-1 rounded">
          NOW
        </span>
      )}
    </div>
  );
}