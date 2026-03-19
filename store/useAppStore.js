import { create } from "zustand";

export const useAppStore = create((set) => ({
  data: null,
  session: null,
  credentials: null, // ✅ ADDED
  loading: false,
  error: null,

  setData: (data) =>
    set(() => ({
      data,
      error: null,
    })),

  setSession: (session) =>
    set(() => ({
      session,
    })),

  setCredentials: (credentials) => // ✅ ADDED
    set(() => ({
      credentials,
    })),

  setLoading: (loading) =>
    set(() => ({
      loading,
    })),

  setError: (error) =>
    set(() => ({
      error,
      loading: false,
    })),

  clearAll: () =>
    set(() => ({
      data: null,
      session: null,
      credentials: null, // ✅ ADDED
      error: null,
      loading: false,
    })),
}));