"use client";

import { useEffect, useState } from "react";
import CompareView from "./CompareView";
import {
  Copy,
  Share2,
  Crown,
  Users,
  Play,
  LogOut,
} from "lucide-react";

export default function LobbyView({ code, userId, onExit }) {
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState("lobby");
  const [creatorId, setCreatorId] = useState(null);
  const [maxUsers, setMaxUsers] = useState(0);
  const [compareData, setCompareData] = useState(null);
  const [expired, setExpired] = useState(false);
  const [loading, setLoading] = useState(false);

  const isCreator = creatorId === userId;

  // =========================
  // 💾 PERSIST
  // =========================
  useEffect(() => {
    if (code && userId) {
      localStorage.setItem(
        "compare_lobby",
        JSON.stringify({ code, userId })
      );
    }
  }, [code, userId]);

  // =========================
  // ⏱ AUTO TERMINATE
  // =========================
  useEffect(() => {
    const timer = setTimeout(() => {
      setExpired(true);
      localStorage.removeItem("compare_lobby");
    }, 2 * 60 * 1000);

    return () => clearTimeout(timer);
  }, []);

  // =========================
  // 🔄 SMART POLLING
  // =========================
  useEffect(() => {
    if (status !== "lobby") return;

    const fetchLobby = async () => {
      try {
        const res = await fetch("/api/compare", {
          method: "POST",
          body: JSON.stringify({
            action: "lobby",
            code,
          }),
        });

        const d = await res.json();

        if (!d.success) {
          setExpired(true);
          return;
        }

        setUsers(d.users);
        setStatus(d.status);
        setCreatorId(d.creator_id);
        setMaxUsers(d.max_users);
      } catch {
        setExpired(true);
      }
    };

    fetchLobby(); // ⚡ instant

    const interval = setInterval(() => {
      fetchLobby();
    }, isCreator ? 6000 : 10000);

    return () => clearInterval(interval);
  }, [code, isCreator, status]);

  // =========================
  // ▶ START
  // =========================
  const start = async () => {
    setLoading(true);

    await fetch("/api/compare", {
      method: "POST",
      body: JSON.stringify({
        action: "start",
        code,
      }),
    });

    setStatus("started");
    setLoading(false);
  };

  // =========================
  // 📊 FETCH COMPARE
  // =========================
  useEffect(() => {
    if (status !== "started") return;

    const fetchCompare = async () => {
      const res = await fetch("/api/compare", {
        method: "POST",
        body: JSON.stringify({
          action: "get",
          code,
        }),
      });

      const d = await res.json();

      if (!d.success) {
        setExpired(true);
      } else {
        setCompareData(d.data);
      }
    };

    fetchCompare();
  }, [status, code]);

  // =========================
  // 📋 COPY
  // =========================
  const copyCode = () => {
    navigator.clipboard.writeText(code);
  };

  // =========================
  // 🔗 SHARE
  // =========================
  const share = async () => {
    const url = `https://academiadex.vercel.app/compare?code=${code}`;

    if (navigator.share) {
      await navigator.share({
        title: "Join my comparison lobby",
        text: `Join using code: ${code}`,
        url,
      });
    } else {
      navigator.clipboard.writeText(url);
      alert("Link copied!");
    }
  };

  // =========================
  // ⛔ EXPIRED
  // =========================
  if (expired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-6 rounded-2xl shadow text-center space-y-4">
          <h1 className="text-xl font-semibold">Session Expired</h1>
          <p className="text-gray-500 text-sm">
            This lobby closed automatically
          </p>

          <button
            onClick={() => {
              localStorage.removeItem("compare_lobby");
              onExit();
            }}
            className="flex items-center justify-center gap-2 bg-black text-white px-4 py-2 rounded-lg w-full"
          >
            <LogOut size={16} />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // =========================
  // 📊 RESULT
  // =========================
  if (status === "started") {
    if (!compareData) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-500">Preparing comparison...</p>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto space-y-4">

          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold">
                Comparison Result
              </h1>
              <p className="text-sm text-gray-500">
                Code: {code}
              </p>
            </div>

            <button
              onClick={() => {
                localStorage.removeItem("compare_lobby");
                onExit();
              }}
              className="text-sm underline"
            >
              New
            </button>
          </div>

          <CompareView data={compareData} />
        </div>
      </div>
    );
  }

  // =========================
  // 🏠 LOBBY
  // =========================
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 space-y-6">

        {/* HEADER */}
        <div className="text-center space-y-2">
          <h1 className="text-xl font-semibold flex items-center justify-center gap-2">
            <Users size={18} />
            Lobby
          </h1>

          <div className="flex items-center justify-center gap-2">
            <span className="font-mono text-lg bg-gray-100 px-3 py-1 rounded">
              {code}
            </span>

            <button
              onClick={copyCode}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <Copy size={16} />
            </button>

            <button
              onClick={share}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <Share2 size={16} />
            </button>
          </div>

          <p className="text-xs text-gray-500">
            Expires in 2 minutes
          </p>
        </div>

        {/* USERS */}
        <div className="space-y-3">
          {users.map((u) => (
            <div
              key={u.id}
              className="flex items-center justify-between px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm">
                  {u.name?.[0]?.toUpperCase()}
                </div>
                <span>{u.name}</span>
              </div>

              {u.id === creatorId && (
                <Crown size={16} className="text-yellow-500" />
              )}
            </div>
          ))}
        </div>

        {/* ACTION */}
        <div className="space-y-3">
          {isCreator ? (
            <button
              onClick={start}
              disabled={loading || users.length < 2}
              className="flex items-center justify-center gap-2 w-full bg-black text-white py-2 rounded-lg disabled:opacity-50"
            >
              <Play size={16} />
              {loading ? "Starting..." : "Start Comparison"}
            </button>
          ) : (
            <p className="text-center text-sm text-gray-500">
              Waiting for host...
            </p>
          )}

          <button
            onClick={() => {
              localStorage.removeItem("compare_lobby");
              onExit();
            }}
            className="flex items-center justify-center gap-2 text-sm text-gray-600 underline w-full"
          >
            <LogOut size={14} />
            Exit
          </button>
        </div>

      </div>
    </div>
  );
}