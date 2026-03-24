"use client";

import { useEffect, useState } from "react";
import { getData } from "@/lib/storage";
import { calculateSGPA, gradePoints } from "@/lib/sgpa";
import { Pencil, RotateCcw, Trash2, Plus } from "lucide-react";

export default function SGPAPage() {
  const [subjects, setSubjects] = useState([]);
  const [originalSubjects, setOriginalSubjects] = useState([]);
  const [grades, setGrades] = useState({});
  const [editMode, setEditMode] = useState(false);

  // 🔥 NEW: counter for auto names
  const [customCount, setCustomCount] = useState(1);

  // 🔥 UPDATED: credit default = 3
  const [newSubject, setNewSubject] = useState({
    name: "",
    credit: 3,
  });

  // =========================
  // 📦 LOAD DATA
  // =========================
  useEffect(() => {
    const data = getData();
    if (!data?.subjects) return;

    const map = {};
    data.subjects.forEach((sub) => {
      if (!sub.course_code) return;

      if (!map[sub.course_code]) {
        map[sub.course_code] = {
          course_code: sub.course_code,
          course_title: sub.course_title,
          credit: sub.credit,
        };
      }
    });

    const merged = Object.values(map);

    const savedSubjects = localStorage.getItem("sgpaSubjects");
    const savedGrades = localStorage.getItem("sgpaGrades");

    setOriginalSubjects(merged);
    setSubjects(savedSubjects ? JSON.parse(savedSubjects) : merged);
    setGrades(savedGrades ? JSON.parse(savedGrades) : {});
  }, []);

  // =========================
  // 💾 SAVE
  // =========================
  useEffect(() => {
    localStorage.setItem("sgpaSubjects", JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem("sgpaGrades", JSON.stringify(grades));
  }, [grades]);

  // =========================
  // 🎯 HANDLERS
  // =========================
  const handleGradeChange = (code, grade) => {
    setGrades((prev) => ({
      ...prev,
      [code]: grade,
    }));
  };

  const handleRemove = (code) => {
    setSubjects((prev) =>
      prev.filter((s) => s.course_code !== code)
    );

    setGrades((prev) => {
      const copy = { ...prev };
      delete copy[code];
      return copy;
    });
  };

  // 🔥 UPDATED ADD LOGIC
  const handleAddSubject = () => {
    const name =
      newSubject.name.trim() ||
      `New Subject ${customCount}`;

    const credit = Math.max(
      1,
      Number(newSubject.credit) || 1
    );

    const id = `CUSTOM_${Date.now()}`;

    const newSub = {
      course_code: id,
      course_title: name,
      credit,
    };

    setSubjects((prev) => [...prev, newSub]);
    setCustomCount((c) => c + 1);

    // reset but keep credit default
    setNewSubject({ name: "", credit: 3 });
  };

  const handleReset = () => {
    setSubjects(originalSubjects);
    setGrades({});
    localStorage.removeItem("sgpaSubjects");
    localStorage.removeItem("sgpaGrades");
  };

  // =========================
  // 🧮 SGPA
  // =========================
  const sgpa = calculateSGPA(subjects, grades);

  const totalCredits = subjects.reduce(
    (sum, s) => sum + (s.credit || 0),
    0
  );

  // =========================
  // 🎨 UI
  // =========================
  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6 space-y-6">

      {/* HEADER */}
      <div className="bg-white p-5 rounded-2xl shadow">
        <h1 className="text-2xl font-bold">
          🎓 SGPA Calculator
        </h1>
      </div>

      {/* TABLE */}
      <div className="bg-white p-5 rounded-2xl shadow overflow-x-auto">
        <table className="w-full text-sm md:text-base">
          <thead>
            <tr className="border-b text-gray-500">
              <th className="py-2 text-left">Course</th>
              <th>Credits</th>
              <th>Grade</th>
            </tr>
          </thead>

          <tbody>
            {subjects.map((sub) => (
              <tr key={sub.course_code} className="border-b">
                <td className="py-3 flex items-center gap-2">

                  {editMode && (
                    <button
                      onClick={() => handleRemove(sub.course_code)}
                      className="text-red-500 hover:scale-110 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}

                  {sub.course_title}
                </td>

                <td>{sub.credit}</td>

                <td>
                  <select
                    value={grades[sub.course_code] || ""}
                    onChange={(e) =>
                      handleGradeChange(
                        sub.course_code,
                        e.target.value
                      )
                    }
                    className="border px-2 py-1 rounded-md"
                  >
                    <option value="">Select</option>
                    {Object.keys(gradePoints).map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ADD SUBJECT (MOVED HERE) */}
      {editMode && (
        <div className="bg-white p-4 rounded-2xl shadow flex flex-col md:flex-row gap-3">
          <input
            type="text"
            placeholder="Course Name (optional)"
            value={newSubject.name}
            onChange={(e) =>
              setNewSubject((p) => ({ ...p, name: e.target.value }))
            }
            className="border px-3 py-2 rounded-md w-full"
          />

          <input
            type="number"
            value={newSubject.credit}
            onChange={(e) =>
              setNewSubject((p) => ({ ...p, credit: e.target.value }))
            }
            className="border px-3 py-2 rounded-md w-full md:w-32"
          />

          <button
            onClick={handleAddSubject}
            className="flex items-center justify-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg"
          >
            <Plus size={16} />
            Add
          </button>
        </div>
      )}

      {/* ACTION BAR */}
      <div className="bg-white p-4 rounded-2xl shadow flex justify-between items-center">
        <div className="flex gap-3">
          <button
            onClick={() => setEditMode((p) => !p)}
            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg"
          >
            <Pencil size={16} />
            {editMode ? "Done" : "Edit"}
          </button>

          <button
            onClick={handleReset}
            className="flex items-center gap-2 bg-gray-200 px-4 py-2 rounded-lg"
          >
            <RotateCcw size={16} />
            Reset
          </button>
        </div>
      </div>

      {/* RESULT */}
      <div className="bg-white p-5 rounded-2xl shadow flex justify-between items-center">
        <div className="text-gray-600">
          Total Credits: {totalCredits}
        </div>

        <div className="text-2xl font-bold">
          SGPA: {sgpa}
        </div>
      </div>

    </div>
  );
}