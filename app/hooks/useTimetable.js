"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useRouter } from "next/navigation";

import timetableData from "@/data/timetable.json";
import plannerData from "@/data/planner.json";

import {
  getCurrentPeriod,
  getNextClassInfo,
  getTodayStr,
  getTodayDayOrder,
} from "@/lib/timetable";

// =========================
// 🔥 LOCAL STORAGE HELPERS
// =========================
const getLocalKey = () => {
  if (typeof window === "undefined") return "timetable_overrides";
  const session_id = localStorage.getItem("session_id") || "guest";
  return `timetable_overrides_${session_id}`;
};

const getLocalOverrides = () => {
  try {
    return JSON.parse(localStorage.getItem(getLocalKey())) || {};
  } catch {
    return {};
  }
};

const setLocalOverrides = (data) => {
  try {
    localStorage.setItem(getLocalKey(), JSON.stringify(data));
  } catch {}
};

export function useTimetableLogic() {
  const router = useRouter();

  // 🔥 GLOBAL STORE
  const {
    data,
    setData,

    // 🔥 GLOBAL NAV GUARD
    setEditingGlobal,
    setHasChangesGlobal,
    requestLeaveGlobal,
  } = useAppStore();

  // =========================
  // LOCAL STATE
  // =========================
  const [activeDayIndexState, _setActiveDayIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [overrides, setOverrides] = useState({});

  // ⚠️ local modal (kept for page safety)
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const hasChanges = useMemo(() => {
    return Object.keys(overrides || {}).length > 0;
  }, [overrides]);

  const currentRef = useRef(null);

  // =========================
  // 🔐 LOAD APP DATA
  // =========================
  useEffect(() => {
    if (!data) {
      const saved = localStorage.getItem("app_data");

      if (saved) {
        setData(JSON.parse(saved));
      } else {
        router.push("/");
      }
    }
  }, [data, setData, router]);

  // =========================
  // 🔥 LOAD OVERRIDES
  // =========================
  useEffect(() => {
    const loadOverrides = async () => {
      const session_id = localStorage.getItem("session_id");

      const local = getLocalOverrides();

      if (local && Object.keys(local).length > 0) {
        setOverrides(local);
      }

      if (!session_id) return;

      try {
        const res = await fetch(
          `/api/timetable?session_id=${session_id}`
        );
        const data = await res.json();

        if (data.success && data.overrides) {
          setOverrides(data.overrides);
          setLocalOverrides(data.overrides);
        }
      } catch (err) {
        console.error("Failed to load overrides", err);
      }
    };

    loadOverrides();
  }, []);

  // =========================
  // 💾 SAVE (ONLY WHEN DONE)
  // =========================
  const saveOverrides = async () => {
    setLocalOverrides(overrides);

    const session_id = localStorage.getItem("session_id");
    if (!session_id) return;

    try {
      await fetch("/api/timetable", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_id,
          overrides,
        }),
      });
    } catch (err) {
      console.error("Failed to save overrides", err);
    }
  };

  // =========================
  // 🔥 SYNC TO GLOBAL STORE
  // =========================
  useEffect(() => {
    setEditingGlobal(isEditing);
  }, [isEditing]);

  useEffect(() => {
    setHasChangesGlobal(hasChanges);
  }, [hasChanges]);

  // =========================
  // 📚 SAFE VALUES
  // =========================
  const subjects = data?.subjects || [];
  const batch = data?.batch || "1";

  const timetable =
    batch === "1" ? timetableData.batch1 : timetableData.batch2;

  const yearData = plannerData["2026"] || {};

  // =========================
  // 📅 TODAY
  // =========================
  const todayStr = getTodayStr();
  const todayOrder = getTodayDayOrder(yearData, todayStr);
  const todayKey = todayOrder ? `Day${todayOrder}` : null;

  const currentPeriod = getCurrentPeriod();
  const nextClass = getNextClassInfo();

  // =========================
  // 📆 DAYS
  // =========================
  const days = useMemo(() => {
    if (!timetable) return [];

    return ["Day1", "Day2", "Day3", "Day4", "Day5"]
      .map((key) => [key, timetable[key]])
      .filter(([_, val]) => val);
  }, [timetable]);

  useEffect(() => {
    if (!todayKey) return;

    const index = days.findIndex(([d]) => d === todayKey);
    if (index !== -1) _setActiveDayIndex(index);
  }, [todayKey, days]);

  // =========================
  // ✏️ EDIT
  // =========================
  const handleOverride = (day, period, courseCode) => {
    const key = `${day}-${period}`;

    setOverrides((prev) => ({
      ...prev,
      [key]: courseCode,
    }));
  };

  const handleResetAll = () => {
    setOverrides({});
  };

  const handleDone = async () => {
    await saveOverrides();
    setIsEditing(false);
  };

  // =========================
  // 🚫 LOCAL GUARD (page)
  // =========================
  const requestLeave = (action) => {
    if (!isEditing || !hasChanges) {
      action?.();
      return;
    }

    setPendingAction(() => action);
    setShowLeaveModal(true);
  };

  const handleDiscard = () => {
    setShowLeaveModal(false);
    setOverrides({});

    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  const handleStay = () => {
    setShowLeaveModal(false);
    setPendingAction(null);
  };

  // =========================
  // 🔥 SAFE NAV (GLOBAL)
  // =========================
  const safePush = (url) => {
    requestLeaveGlobal(() => router.push(url));
  };

  const setActiveDayIndex = (index) => {
    requestLeave(() => _setActiveDayIndex(index));
  };

  // =========================
  // 🚫 BACK BUTTON
  // =========================
  useEffect(() => {
    const handlePopState = () => {
      if (!isEditing || !hasChanges) return;

      setShowLeaveModal(true);

      window.history.pushState(null, "", window.location.href);

      setPendingAction(() => () => {
        window.removeEventListener("popstate", handlePopState);
        window.history.back();
      });
    };

    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isEditing, hasChanges]);

  // =========================
  // 🚫 REFRESH
  // =========================
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!isEditing || !hasChanges) return;

      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isEditing, hasChanges]);

  // =========================
  // 📍 SCROLL
  // =========================
  useEffect(() => {
    currentRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [activeDayIndexState, currentPeriod]);

  return {
    data,
    batch,
    subjects,
    days,
    todayKey,
    currentPeriod,
    nextClass,

    activeDayIndex: activeDayIndexState,
    setActiveDayIndex,

    isEditing,
    setIsEditing,
    overrides,
    handleOverride,
    handleResetAll,
    handleDone,

    findSubject: (slotValue) => {
      if (!slotValue) return null;
      const slots = slotValue.split("/").map((s) => s.trim());
      return (
        subjects.find((s) =>
          slots.some(
            (slot) =>
              slot.includes(s.slot) || s.slot?.includes(slot)
          )
        ) || null
      );
    },

    subjectColorMap: {},
    currentRef,

    safePush,

    showLeaveModal,
    handleDiscard,
    handleStay,
  };
}