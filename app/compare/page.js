"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import LobbyView from "@/components/compare/LobbyView";

export default function ComparePage() {
  const { data } = useAppStore();

  const [mode, setMode] = useState("home");
  const [code, setCode] = useState("");
  const [userId, setUserId] = useState("");
  const [maxUsers, setMaxUsers] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const semester =
    data?.student?.semester ||
    data?.raw?.attendance?.student_info?.semester ||
    data?.raw?.timetable?.student_info?.semester ||
    null;

  // =========================
  // 💾 RESTORE SESSION (SAFE)
  // =========================
  useEffect(() => {
    try {
      const saved = localStorage.getItem("compare_session");
      if (!saved) return;

      const parsed = JSON.parse(saved);

      if (parsed?.code && parsed?.userId) {
        setCode(parsed.code);
        setUserId(parsed.userId);

        // 🔥 restore correct mode
        setMode("lobby");
      }
    } catch {
      localStorage.removeItem("compare_session");
    }
  }, []);

  // =========================
  // 🔗 URL CODE SUPPORT
  // =========================
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlCode = params.get("code");

    if (urlCode) {
      setCode(urlCode.toUpperCase());
    }
  }, []);

  // =========================
  // 💾 SAVE SESSION
  // =========================
  const saveSession = (newCode, newUserId) => {
    localStorage.setItem(
      "compare_session",
      JSON.stringify({
        code: newCode,
        userId: newUserId,
      })
    );
  };

  // =========================
  // CREATE
  // =========================
  const create = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/compare", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "create",
          name: data?.student?.name,
          marks: data?.marks,
          maxUsers,
          semester,
        }),
      });

      const d = await res.json();

      if (!d.success) {
        throw new Error(d.message || "Failed to create lobby");
      }

      setCode(d.code);
      setUserId(d.userId);
      setMode("lobby");

      saveSession(d.code, d.userId); // 🔥 persist
    } catch (err) {
      console.error(err);
      setError(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // JOIN
  // =========================
  const join = async () => {
    if (!code) {
      setError("Enter a valid code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/compare", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "join",
          code,
          name: data?.student?.name,
          marks: data?.marks,
          semester,
        }),
      });

      const d = await res.json();

      if (!d.success) {
        if (d.type === "SEM_MISMATCH") {
          throw new Error(`⚠️ ${d.message}`);
        }
        throw new Error(d.message || "Failed to join");
      }

      setUserId(d.userId);
      setMode("lobby");

      saveSession(code, d.userId); // 🔥 persist
    } catch (err) {
      console.error(err);
      setError(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LOBBY / COMPARE VIEW
  // =========================
  if (mode === "lobby") {
    return (
      <LobbyView
        code={code}
        userId={userId}
        onExit={() => {
          localStorage.removeItem("compare_session");
          setMode("home");
        }}
      />
    );
  }

  // =========================
  // HOME UI
  // =========================
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-6 space-y-6">

        <div>
          <h1 className="text-2xl font-bold">Compare Scores</h1>
          <p className="text-sm text-gray-500">
            Create or join a lobby
          </p>
        </div>

        <div className="text-sm text-gray-600">
          Semester:{" "}
          <span className="font-medium">
            {semester || "Not found"}
          </span>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 p-2 rounded-lg">
            {error}
          </div>
        )}

        {/* CREATE */}
        <div className="space-y-3 border-t pt-4">
          <h2 className="font-semibold">Create Lobby</h2>

          <select
            value={maxUsers}
            onChange={(e) => setMaxUsers(Number(e.target.value))}
            className="w-full border rounded-lg px-3 py-2"
          >
            {[2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n} users
              </option>
            ))}
          </select>

          <button
            onClick={create}
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded-lg"
          >
            {loading ? "Creating..." : "Create Lobby"}
          </button>
        </div>

        {/* JOIN */}
        <div className="space-y-3 border-t pt-4">
          <h2 className="font-semibold">Join Lobby</h2>

          <input
            placeholder="Enter code"
            value={code}
            onChange={(e) =>
              setCode(e.target.value.toUpperCase())
            }
            className="w-full border rounded-lg px-3 py-2"
          />

          <button
            onClick={join}
            disabled={loading}
            className="w-full bg-gray-900 text-white py-2 rounded-lg"
          >
            {loading ? "Joining..." : "Join Lobby"}
          </button>
        </div>

      </div>
    </div>
  );
}