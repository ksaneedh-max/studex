"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function AdminPage() {
  const getISTDate = () => {
    return new Date(
      new Date().toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
      })
    )
      .toISOString()
      .slice(0, 10);
  };

  const [data, setData] = useState([]);

  // ✅ FIXED: Use IST date instead of UTC
  const [date, setDate] = useState(getISTDate());

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authorized, setAuthorized] = useState(false);

  // =========================
  // 🔐 PROTECT ROUTE
  // =========================
  useEffect(() => {
    const auth = localStorage.getItem("admin_auth");

    if (auth !== "true") {
      window.location.href = "/admin/login";
    } else {
      setAuthorized(true);
    }
  }, []);

  // =========================
  // 🔄 FETCH DATA
  // =========================
  const fetchData = async (selectedDate) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/admin/hourly?date=${selectedDate}`
      );

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to fetch");
      }

      setData(json.data || []);
    } catch (err) {
      console.error("Admin fetch error:", err);
      setError(err.message || "Failed to load data");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authorized) {
      fetchData(date);
    }
  }, [date, authorized]);

  // =========================
  // 📊 CALCULATIONS
  // =========================
  const total = data.reduce((a, b) => a + (b.count || 0), 0);

  const peak = data.length
    ? Math.max(...data.map((d) => d.count || 0))
    : 0;

  const avg = data.length ? Math.round(total / data.length) : 0;

  // Prevent flicker
  if (!authorized) return null;

  return (
    <div className="min-h-screen bg-gray-100 p-6 space-y-6">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold">
          📊 Admin Analytics
        </h1>

        <div className="flex gap-2">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border px-3 py-2 rounded"
          />

          <button
            onClick={() => {
              localStorage.removeItem("admin_auth");
              window.location.href = "/admin/login";
            }}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="bg-red-100 text-red-600 p-3 rounded">
          {error}
        </div>
      )}

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard title="Total Users" value={total} />
        <StatCard title="Peak Hour Users" value={peak} />
        <StatCard title="Avg / Hour" value={avg} />
      </div>

      {/* GRAPH */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-4">
          Hourly Activity
        </h2>

        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            Loading...
          </div>
        ) : data.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            No data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="hour"
                tickFormatter={(h) => `${h}:00`}
              />
              <YAxis allowDecimals={false} />
              <Tooltip
                formatter={(value) => [`${value}`, "Users"]}
                labelFormatter={(label) => `${label}:00`}
              />
              <Line
                type="monotone"
                dataKey="count"
                strokeWidth={2}
                dot
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* USERS LIST */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-4">
          Users by Hour
        </h2>

        {data.map((item) => {
          const users = Object.values(item.users || {});

          if (users.length === 0) return null;

          return (
            <div key={item.hour} className="mb-4">
              <div className="font-semibold mb-1">
                {item.hour}:00 ({users.length} users)
              </div>

              <div className="flex flex-wrap gap-2">
                {users.map((name, idx) => (
                  <span
                    key={idx}
                    className="bg-gray-200 px-2 py-1 rounded text-sm"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}

// =========================
// 🔹 STAT CARD
// =========================
function StatCard({ title, value }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <div className="text-gray-500 text-sm">{title}</div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  );
}