"use client";

import { useTimetableLogic } from "@/app/hooks/useTimetable";

import MobileTimetable from "@/components/timetable/MobileTimetable";
import DesktopTimetable from "@/components/timetable/DesktopTimetable";
import Card from "@/components/ui/Card";

export default function Timetable() {
  const {
    data,
    batch,
    subjects,
    days,
    todayKey,
    currentPeriod,
    nextClass,
    activeDayIndex,
    setActiveDayIndex,
    isEditing,
    setIsEditing,
    overrides,
    handleOverride,
    handleResetAll,
    findSubject,
    subjectColorMap,
    currentRef,
    handleTouchStart,
    handleTouchEnd,
  } = useTimetableLogic();

  if (!data) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">
            Day Order Timetable
          </h1>

          <div className="text-sm text-gray-500 space-y-1">
            <p>Batch {batch}</p>

            {nextClass ? (
              <p className="text-blue-600 font-medium">
                ⏱ {nextClass.minutesLeft} mins to {nextClass.period}
              </p>
            ) : (
              <p className="text-green-600 font-medium">
                🎉 No more classes today
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          {isEditing && (
            <button
              onClick={handleResetAll}
              className="px-3 py-1.5 text-sm rounded-lg border bg-red-50 text-red-600 hover:bg-red-100"
            >
              Reset All
            </button>
          )}

          <button
            onClick={() => setIsEditing((p) => !p)}
            className={`px-3 py-1.5 text-sm rounded-lg border transition ${
              isEditing
                ? "bg-black text-white"
                : "bg-white hover:bg-gray-100"
            }`}
          >
            {isEditing ? "Done" : "Edit Optional"}
          </button>
        </div>
      </div>

      <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        {!todayKey && (
          <Card className="mb-4">
            <p className="text-gray-500 text-center">
              🎉 Holiday / No classes today
            </p>
          </Card>
        )}

        <MobileTimetable
          days={days}
          activeDayIndex={activeDayIndex}
          setActiveDayIndex={setActiveDayIndex}
          todayKey={todayKey}
          currentPeriod={currentPeriod}
          findSubject={findSubject}
          currentRef={currentRef}
          isEditing={isEditing}
          overrides={overrides}
          handleOverride={handleOverride}
          subjects={subjects}
          subjectColorMap={subjectColorMap}
        />

        <DesktopTimetable
          days={days}
          todayKey={todayKey}
          currentPeriod={currentPeriod}
          findSubject={findSubject}
          currentRef={currentRef}
          isEditing={isEditing}
          overrides={overrides}
          handleOverride={handleOverride}
          subjects={subjects}
          subjectColorMap={subjectColorMap}
        />
      </div>
    </div>
  );
}