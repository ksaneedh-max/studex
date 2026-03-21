"use client";

import { useState, useRef, useEffect } from "react";
import { predictGrade } from "@/lib/grade";

const grades = ["O", "A+", "A", "B+", "B", "C"];

export default function GradePredictor({ tests }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);

  const ref = useRef();

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Calculate totals
  let obtained = 0;
  let currentMax = 0;

  (tests || []).forEach((t) => {
    obtained += Number(t.obtained) || 0;
    currentMax += Number(t.max) || 0;
  });

  const handleSelect = (grade) => {
    setSelected(grade);

    const res = predictGrade({
      obtained,
      currentMax,
      targetGrade: grade,
    });

    setResult(res);
  };

  return (
    <div className="relative" ref={ref}>
      {/* 🔥 Improved Button */}
      <button
        onClick={() => setOpen(!open)}
        className="text-xs px-2 py-1 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
      >
        🎯 Target
      </button>

      {/* Popup */}
      {open && (
        <div className="absolute right-0 mt-2 w-60 bg-white border rounded-xl shadow-lg p-3 z-10 animate-in fade-in zoom-in-95">

          {/* Header */}
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold">
              Predict Grade
            </span>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-gray-600 text-xs"
            >
              ✕
            </button>
          </div>

          {/* ✅ Helper Text */}
          <p className="text-xs text-gray-500 mb-3">
            Select a grade to see how many marks you need in remaining tests.
          </p>

          {/* Grade Buttons */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {grades.map((g) => (
              <button
                key={g}
                onClick={() => handleSelect(g)}
                className={`text-xs py-1 rounded-md border transition ${
                  selected === g
                    ? "bg-blue-600 text-white"
                    : "hover:bg-gray-100"
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          {/* Result */}
          {result && (
            <div
              className={`text-xs font-semibold p-2 rounded-md text-center ${
                result.status === "possible"
                  ? "bg-green-50 text-green-600"
                  : result.status === "impossible"
                  ? "bg-red-50 text-red-600"
                  : "bg-blue-50 text-blue-600"
              }`}
            >
              {/* Possible */}
              {result.status === "possible" && (
                <>
                  You need <b>{result.required}</b> out of{" "}
                  <b>{result.futureMax}</b>
                </>
              )}

              {/* Achieved */}
              {result.status === "achieved" && (
                <>
                  You’ve already secured this grade 🎉
                </>
              )}

              {/* Impossible */}
              {result.status === "impossible" && (
                <>
                  Even with full marks, you can only reach{" "}
                  <b>{result.message.split(": ")[1]}</b>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}