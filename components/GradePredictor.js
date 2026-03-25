"use client";

import { useState, useRef, useEffect } from "react";
import { predictGrade } from "@/lib/grade";
import { Target, X } from "lucide-react";

const grades = ["O", "A+", "A", "B+", "B", "C"];

export default function GradePredictor({ tests }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);

  const ref = useRef();

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
      {/* 🔥 TRIGGER */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 
        text-xs font-medium text-black
        border border-gray-300 rounded-lg 
        bg-white hover:bg-gray-50 
        transition-all duration-200"
      >
        <Target className="w-4 h-4" />
        Target
      </button>

      {/* 🔥 PANEL */}
      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg p-4 z-10">

          {/* HEADER */}
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold text-black">
              Target Grade
            </h3>

            <button
              onClick={() => setOpen(false)}
              className="p-1 rounded-md hover:bg-gray-100 transition"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* HELPER */}
          <p className="text-xs text-gray-500 mb-4 leading-relaxed">
            Choose a grade to see the marks required in upcoming tests.
          </p>

          {/* GRADES */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {grades.map((g) => {
              const isActive = selected === g;

              return (
                <button
                  key={g}
                  onClick={() => handleSelect(g)}
                  className={`text-xs py-1.5 rounded-md border 
                  transition-all duration-150
                  ${
                    isActive
                      ? "bg-black text-white border-black"
                      : "border-gray-300 hover:bg-gray-100 text-gray-800"
                  }`}
                >
                  {g}
                </button>
              );
            })}
          </div>

          {/* RESULT */}
          {result && (
            <div className="mt-2 pt-3 border-t border-gray-200 text-center">

              {/* MAIN RESULT */}
              <div className="text-sm font-semibold text-black mb-1">
                {result.status === "possible" && (
                  <>
                    {result.required} / {result.futureMax}
                  </>
                )}

                {result.status === "achieved" && (
                  <>Already Achieved ✓</>
                )}

                {result.status === "impossible" && (
                  <>
                    {result.message.split(": ")[1]}
                  </>
                )}
              </div>

              {/* SUBTEXT */}
              <div className="text-xs text-gray-500">
                {result.status === "possible" &&
                  "Marks needed in remaining tests"}

                {result.status === "achieved" &&
                  "You’re already at this grade"}

                {result.status === "impossible" &&
                  "Maximum achievable grade"}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}