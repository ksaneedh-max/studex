import { create } from "zustand";

export const useAppStore = create((set) => ({
  data: null,
  session: null,
  credentials: null,
  loading: false,
  error: null,

  // =========================
  // ✅ DATA
  // =========================
  setData: (data) =>
    set(() => ({
      data,
      error: null,
    })),

  // =========================
  // ✅ SESSION (SAFE)
  // =========================
  setSession: (session) =>
    set(() => ({
      session:
        session && Object.keys(session).length > 0
          ? session
          : null,
    })),

  // =========================
  // ✅ CREDENTIALS (REQUIRED FOR AUTO REFRESH)
  // =========================
  setCredentials: (credentials) =>
    set(() => ({
      credentials:
        credentials?.email && credentials?.password
          ? credentials
          : null,
    })),

  // =========================
  // ✅ LOADING
  // =========================
  setLoading: (loading) =>
    set(() => ({
      loading,
    })),

  // =========================
  // ✅ ERROR
  // =========================
  setError: (error) =>
    set(() => ({
      error,
      loading: false,
    })),

  // =========================
  // 🔥 OPTIONAL: CLEAR ONLY DATA (keep session)
  // =========================
  clearData: () =>
    set(() => ({
      data: null,
    })),

  // =========================
  // 🔥 CLEAR EVERYTHING (LOGOUT)
  // =========================
  clearAll: () =>
    set(() => ({
      data: null,
      session: null,
      credentials: null,
      error: null,
      loading: false,
    })),
}));