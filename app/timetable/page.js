"use client";

import { useState } from "react";
import { useTimetableLogic } from "@/app/hooks/useTimetable";
import { useAppStore } from "@/store/useAppStore";

import MobileTimetable from "@/components/timetable/MobileTimetable";
import DesktopTimetable from "@/components/timetable/DesktopTimetable";
import Card from "@/components/ui/Card";

// ✅ NEW IMPORT
import { exportTimetableImage } from "@/app/utils/exportTimetableImage";

// ✅ ICONS
import { Pencil, Check, Download } from "lucide-react";

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
    handleDone,
    findSubject,
    subjectColorMap,
    currentRef,

    // swipe
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    dragX,
    isDragging,
  } = useTimetableLogic();

  const {
    showLeaveModal,
    handleDiscardGlobal,
    handleStayGlobal,
  } = useAppStore();

  const [isDownloading, setIsDownloading] = useState(false);

  if (!data) {
    return <div className="p-6">Loading...</div>;
  }

  const handleDownload = async () => {
    try {
      setIsDownloading(true);

      await exportTimetableImage({
        days,
        subjects,
        overrides,
        findSubject,
      });
    } catch (err) {
      console.error("Download failed", err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
      {/* HEADER */}
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

        {/* ACTION BUTTONS */}
        <div className="flex flex-col items-end gap-2">
          {isEditing && (
            <button
              onClick={handleResetAll}
              className="px-3 py-1.5 text-sm rounded-lg border bg-red-50 text-red-600 hover:bg-red-100"
            >
              Reset All
            </button>
          )}

          <button
            onClick={async () => {
              if (isEditing) {
                await handleDone();
              } else {
                setIsEditing(true);
              }
            }}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border transition ${
              isEditing
                ? "bg-black text-white"
                : "bg-white hover:bg-gray-100"
            }`}
          >
            {isEditing ? (
              <>
                <Check size={16} />
                Done
              </>
            ) : (
              <>
                <Pencil size={16} />
                Edit Optional
              </>
            )}
          </button>

          {/* 📥 DOWNLOAD BUTTON */}
          {!isEditing && (
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg border shadow-sm transition ${
                isDownloading
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-black text-white hover:bg-gray-800"
              }`}
            >
              {isDownloading ? (
                <>
                  <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></span>
                  Generating...
                </>
              ) : (
                <>
                  <Download size={16} />
                  Download Timetable
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* SWIPE CONTAINER */}
      <div
        onTouchStart={(e) => {
          if (e.target.closest("select")) return;
          handleTouchStart(e);
        }}
        onTouchMove={handleTouchMove}
        onTouchEnd={(e) => {
          if (e.target.closest("select")) return;
          handleTouchEnd(e);
        }}
      >
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
          dragX={dragX}
          isDragging={isDragging}
          handleTouchStart={handleTouchStart}
          handleTouchMove={handleTouchMove}
          handleTouchEnd={handleTouchEnd}
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

      {/* GLOBAL MODAL */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-xl w-80 shadow-lg">
            <h2 className="text-lg font-semibold mb-2">
              Unsaved Changes
            </h2>

            <p className="text-sm text-gray-600 mb-4">
              You have unsaved changes. Do you want to discard them?
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={handleStayGlobal}
                className="px-3 py-1 rounded hover:bg-gray-100"
              >
                Stay
              </button>

              <button
                onClick={handleDiscardGlobal}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}