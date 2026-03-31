"use client";

import { createContext, useContext, useState } from "react";
import { CheckCircle2, RefreshCcw, XCircle } from "lucide-react"; // ✅ added XCircle

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const [visible, setVisible] = useState(false);

  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setVisible(true);

    setTimeout(() => {
      setVisible(false);
    }, 2500);

    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {toast && (
        <div
          className={`fixed top-5 left-1/2 -translate-x-1/2 z-50
          transition-all duration-500 ease-out
          ${visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-5"}`}
        >
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg backdrop-blur-md border bg-white/80 border-gray-200">

            {/* ICON */}
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full
              ${
                toast.type === "success"
                  ? "bg-green-100"
                  : toast.type === "error"
                  ? "bg-red-100"
                  : "bg-blue-100"
              }`}
            >
              {toast.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              ) : toast.type === "error" ? (
                <XCircle className="w-5 h-5 text-red-600" />
              ) : (
                <RefreshCcw className="w-5 h-5 text-blue-600" />
              )}
            </div>

            {/* TEXT */}
            <p className="text-sm font-medium text-gray-800">
              {toast.message}
            </p>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

// ✅ Hook
export const useToast = () => useContext(ToastContext);