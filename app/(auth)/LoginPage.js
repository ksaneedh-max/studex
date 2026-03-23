"use client";

import { useState, useEffect } from "react";
import { loginUser } from "@/lib/api";
import { useAppStore } from "@/store/useAppStore";
import { saveData } from "@/lib/storage";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const { setData, setError, error } = useAppStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [checking, setChecking] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // 🔥 LOCAL loading
  const [isSubmitting, setIsSubmitting] = useState(false);

  // =========================
  // 🔄 REMOVE AUTO LOGIN CHECK (FIXED)
  // =========================
  useEffect(() => {
    // ✅ Just allow UI to render
    setChecking(false);
  }, []);

  // =========================
  // 🔐 LOGIN HANDLER
  // =========================
  const handleLogin = async () => {
    if (isSubmitting) return;

    if (!email?.trim() || !password?.trim()) {
      setError("Please enter email and password");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      let formattedEmail = email.trim().toLowerCase();

      if (!formattedEmail.includes("@")) {
        formattedEmail = `${formattedEmail}@srmist.edu.in`;
      }

      if (!formattedEmail.endsWith("@srmist.edu.in")) {
        formattedEmail =
          formattedEmail.split("@")[0] + "@srmist.edu.in";
      }

      const res = await loginUser({
        email: formattedEmail,
        password,
      });

      if (!res || !res.success) {
        throw new Error("Authentication failed");
      }

      setData(res.data);
      saveData(res.data);

      if (res.session_id) {
        localStorage.setItem("session_id", res.session_id);
      }

      // 🔥 allow animation to be visible
      setTimeout(() => {
        router.replace("/dashboard");
      }, 700);

    } catch (err) {
      setError(err.message || "Login failed");
      setIsSubmitting(false);
    }
  };

  // =========================
  // ⌨️ ENTER KEY
  // =========================
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !isSubmitting) {
      handleLogin();
    }
  };

  // =========================
  // ⏳ LOADING SCREEN
  // =========================
  if (checking) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-gray-500">
          Checking session...
        </div>
      </div>
    );
  }

  // =========================
  // 🎨 UI
  // =========================
  return (
    <div className="flex items-center justify-center h-full px-4">
      <div className="w-full max-w-md bg-white p-7 rounded-2xl shadow-xl space-y-5">

        {/* Title */}
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-bold text-gray-800">
            Academia DeX
          </h1>
          <p className="text-sm text-gray-500">
            Sign in to continue
          </p>
        </div>

        {/* Email */}
        <input
          className="
            border border-gray-300
            p-3 w-full rounded-lg
            focus:outline-none focus:ring-2 focus:ring-blue-500
            transition
          "
          placeholder="Email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError(null);
          }}
          onKeyDown={handleKeyDown}
        />

        {/* Password */}
        <div className="relative">
          <input
            className="
              border border-gray-300
              p-3 w-full rounded-lg
              focus:outline-none focus:ring-2 focus:ring-blue-500
              pr-12
            "
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError(null);
            }}
            onKeyDown={handleKeyDown}
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        {/* BUTTON WITH LOADER */}
        <button
          onClick={handleLogin}
          disabled={isSubmitting}
          className={`
            w-full py-3 rounded-lg font-medium
            flex items-center justify-center
            transition-all duration-300
            ${
              isSubmitting
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }
            text-white
          `}
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Logging in...
            </div>
          ) : (
            "Login"
          )}
        </button>

        {/* Error */}
        {error && (
          <p className="text-red-500 text-sm text-center">
            {error}
          </p>
        )}

      </div>
    </div>
  );
}