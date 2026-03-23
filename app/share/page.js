"use client";

import { useState } from "react";
import QRCode from "react-qr-code";

export default function SharePage() {
  const link = "https://academiadex.vercel.app/";
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Academia DeX",
          text: "Check my academic dashboard",
          url: link,
        });
      } catch {}
    } else {
      handleCopy();
    }
  };

  return (
    <div className="h-full flex items-center justify-center bg-gray-50">

      <div className="w-full max-w-sm px-1">

        <div className="bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.08)] p-6 text-center space-y-6">

          {/* 🔥 FUSED LOGO */}
          <div className="flex justify-center">
            <h1 className="flex items-center text-xl tracking-tight leading-none">

              {/* A logo (no spacing) */}
              <span className="
                w-8 h-8
                flex items-center justify-center
                rounded-lg
                bg-gradient-to-br from-black to-gray-800
                text-white text-sm font-semibold
              ">
                A
              </span>

              {/* merged text */}
              <span className="-ml-[2px] font-medium">
                cademia
              </span>

              <span className="font-bold ml-[1px]">
                DeX
              </span>

            </h1>
          </div>

          {/* Subtitle */}
          <p className="text-sm text-gray-500">
            Scan to open dashboard
          </p>

          {/* QR */}
          <div className="flex flex-col items-center gap-3">
            <div className="bg-gray-50 p-4 rounded-2xl shadow-inner">
              <QRCode value={link} size={170} />
            </div>

            <p className="text-xs text-gray-400">
              Quick scan access
            </p>
          </div>

          {/* Branded label */}
          <div className="bg-gray-50 rounded-xl px-3 py-2 text-xs text-gray-600 break-all">
            {link}
          </div>

          {/* Actions */}
          <div className="flex gap-2">

            <button
              onClick={handleCopy}
              className="
                flex-1 py-2 rounded-xl
                bg-gray-100 text-sm
                active:scale-95 transition
              "
            >
              {copied ? "Copied ✓" : "Copy"}
            </button>

            <button
              onClick={handleShare}
              className="
                flex-1 py-2 rounded-xl
                bg-black text-white text-sm
                active:scale-95 transition
              "
            >
              Share
            </button>

          </div>

        </div>

      </div>
    </div>
  );
}