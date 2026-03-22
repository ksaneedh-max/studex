"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();

  const [id, setId] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, password }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error("Invalid credentials");
      }

      localStorage.setItem("admin_auth", "true");

      router.push("/admin");

    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="bg-white p-6 rounded-xl shadow w-full max-w-sm space-y-4">

        <h1 className="text-xl font-bold text-center">
          Admin Login
        </h1>

        <input
          className="border p-2 w-full rounded"
          placeholder="Admin ID"
          value={id}
          onChange={(e) => setId(e.target.value)}
        />

        <input
          type="password"
          className="border p-2 w-full rounded"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="bg-blue-500 text-white w-full py-2 rounded"
        >
          Login
        </button>

      </div>
    </div>
  );
}